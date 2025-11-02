const Tesseract = require('tesseract.js');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class OCRService {
  constructor() {
    this.tempDir = path.join(__dirname, '../uploads/temp');
    this.ensureTempDir();
  }

  /**
   * 임시 디렉토리 생성
   */
  ensureTempDir() {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * 영상에서 OCR 텍스트 추출
   * @param {string} videoPath - 영상 파일 경로
   * @param {Object} options - 추출 옵션
   * @returns {Promise<string>} 추출된 텍스트
   */
  async extractTextFromVideo(videoPath, options = {}) {
    const {
      interval = 2,      // 프레임 추출 간격 (초)
      cropArea = 'bottom', // 크롭 영역 (bottom: 하단 자막 영역)
      languages = 'kor+eng' // OCR 언어
    } = options;

    try {
      // 1. 영상에서 프레임 추출
      const frameDir = await this.extractFrames(videoPath, interval, cropArea);
      
      // 2. 각 프레임에서 OCR 실행
      const extractedTexts = await this.processFrames(frameDir, languages);
      
      // 3. 중복 제거 및 텍스트 정리
      const cleanedText = this.cleanAndDeduplicateText(extractedTexts);
      
      // 4. 임시 파일 정리
      this.cleanupTempFiles(frameDir);
      
      return cleanedText;
    } catch (error) {
      console.error('OCR 처리 오류:', error);
      throw new Error(`OCR 텍스트 추출 실패: ${error.message}`);
    }
  }

  /**
   * 이미지에서 직접 OCR 텍스트 추출
   * @param {string} imagePath - 이미지 파일 경로
   * @param {string} languages - OCR 언어
   * @returns {Promise<string>} 추출된 텍스트
   */
  async extractTextFromImage(imagePath, languages = 'kor+eng') {
    try {
      const { data: { text } } = await Tesseract.recognize(imagePath, languages, {
        logger: m => console.log(`OCR 진행률: ${Math.round(m.progress * 100)}%`)
      });
      
      return text.trim();
    } catch (error) {
      console.error('이미지 OCR 오류:', error);
      throw new Error(`이미지 OCR 실패: ${error.message}`);
    }
  }

  /**
   * 영상에서 프레임 추출
   * @param {string} videoPath - 영상 파일 경로
   * @param {number} interval - 추출 간격 (초)
   * @param {string} cropArea - 크롭 영역
   * @returns {Promise<string>} 프레임 저장 디렉토리
   */
  async extractFrames(videoPath, interval, cropArea) {
    const frameDir = path.join(this.tempDir, `frames_${Date.now()}`);
    fs.mkdirSync(frameDir, { recursive: true });

    try {
      let cropFilter = '';
      if (cropArea === 'bottom') {
        // 하단 25% 영역만 추출 (자막 영역)
        cropFilter = ',crop=iw:ih*0.25:0:ih*0.75';
      }

      const command = `ffmpeg -i "${videoPath}" -vf "fps=1/${interval}${cropFilter}" "${frameDir}/frame_%03d.jpg"`;
      
      execSync(command, { stdio: 'inherit' });
      
      return frameDir;
    } catch (error) {
      throw new Error(`프레임 추출 실패: ${error.message}`);
    }
  }

  /**
   * 추출된 프레임들에서 OCR 실행
   * @param {string} frameDir - 프레임 디렉토리
   * @param {string} languages - OCR 언어
   * @returns {Promise<Array>} 추출된 텍스트 배열
   */
  async processFrames(frameDir, languages) {
    const frameFiles = fs.readdirSync(frameDir)
      .filter(file => file.endsWith('.jpg'))
      .sort();

    const extractedTexts = [];
    
    console.log(`총 ${frameFiles.length}개 프레임에서 OCR 실행 중...`);
    
    for (let i = 0; i < frameFiles.length; i++) {
      const framePath = path.join(frameDir, frameFiles[i]);
      
      try {
        const { data: { text } } = await Tesseract.recognize(framePath, languages, {
          logger: () => {} // 개별 프레임 로그 비활성화
        });
        
        if (text.trim()) {
          extractedTexts.push(text.trim());
        }
        
        // 진행률 표시
        if ((i + 1) % 10 === 0 || i === frameFiles.length - 1) {
          console.log(`OCR 진행률: ${Math.round((i + 1) / frameFiles.length * 100)}%`);
        }
      } catch (error) {
        console.warn(`프레임 ${frameFiles[i]} OCR 실패:`, error.message);
      }
    }
    
    return extractedTexts;
  }

  /**
   * 텍스트 정리 및 중복 제거
   * @param {Array} texts - 추출된 텍스트 배열
   * @returns {string} 정리된 텍스트
   */
  cleanAndDeduplicateText(texts) {
    // 빈 텍스트 제거
    const validTexts = texts.filter(text => text && text.trim().length > 2);
    
    // 중복 제거 (유사도 기반)
    const uniqueTexts = [];
    
    for (const text of validTexts) {
      const isDuplicate = uniqueTexts.some(existing => 
        this.calculateSimilarity(text, existing) > 0.8
      );
      
      if (!isDuplicate) {
        uniqueTexts.push(text);
      }
    }
    
    return uniqueTexts.join('\n\n');
  }

  /**
   * 두 텍스트 간의 유사도 계산
   * @param {string} text1 - 첫 번째 텍스트
   * @param {string} text2 - 두 번째 텍스트
   * @returns {number} 유사도 (0-1)
   */
  calculateSimilarity(text1, text2) {
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    
    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];
    
    return intersection.length / union.length;
  }

  /**
   * 임시 파일 정리
   * @param {string} dirPath - 정리할 디렉토리 경로
   */
  cleanupTempFiles(dirPath) {
    try {
      if (fs.existsSync(dirPath)) {
        fs.rmSync(dirPath, { recursive: true, force: true });
      }
    } catch (error) {
      console.warn('임시 파일 정리 실패:', error.message);
    }
  }
}

module.exports = OCRService;