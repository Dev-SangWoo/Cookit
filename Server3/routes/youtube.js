const express = require('express');
const router = express.Router();
const axios = require('axios');

// YouTube Data API v3 설정
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';

// 요리 관련 키워드 목록
const COOKING_KEYWORDS = [
  '요리', '레시피', '쿠킹', '조리법', '음식 만들기',
  'cooking', 'recipe', 'food', 'chef', 'kitchen',
  '한식', '중식', '일식', '양식', '디저트'
];

// 요리 영상 검색
router.get('/search', async (req, res) => {
  try {
    const { query, maxResults = 20, pageToken } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: '검색어가 필요합니다.' });
    }

    // 요리 관련 키워드가 포함된 검색어인지 확인
    const isCookingQuery = COOKING_KEYWORDS.some(keyword => 
      query.toLowerCase().includes(keyword.toLowerCase())
    );

    if (!isCookingQuery) {
      // 요리 관련 키워드가 없으면 자동으로 추가
      const enhancedQuery = `요리 ${query}`;
      return await searchYouTubeVideos(enhancedQuery, maxResults, pageToken, res);
    }

    await searchYouTubeVideos(query, maxResults, pageToken, res);

  } catch (error) {
    console.error('YouTube 검색 오류:', error);
    res.status(500).json({ error: 'YouTube 검색 중 오류가 발생했습니다.' });
  }
});

// YouTube 영상 검색 함수
async function searchYouTubeVideos(query, maxResults, pageToken, res) {
  try {
    const searchParams = {
      part: 'snippet',
      q: query,
      type: 'video',
      videoCategoryId: '26', // People & Blogs (요리 채널들이 주로 사용)
      order: 'relevance',
      maxResults: Math.min(parseInt(maxResults), 50),
      regionCode: 'KR',
      relevanceLanguage: 'ko',
      key: YOUTUBE_API_KEY
    };

    if (pageToken) {
      searchParams.pageToken = pageToken;
    }

    const response = await axios.get(`${YOUTUBE_API_URL}/search`, {
      params: searchParams
    });

    // 영상 상세 정보 가져오기 (조회수, 좋아요 수 등)
    const videoIds = response.data.items.map(item => item.id.videoId).join(',');
    const videoDetails = await getVideoDetails(videoIds);

    // 검색 결과 가공 (Embed 불가능 영상 제외)
    const searchResults = response.data.items
      .map((item, index) => {
        const details = videoDetails[index];
        const isNotEmbeddable = details?.status?.embeddable === false;
        return {
          videoId: item.id.videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
          channelTitle: item.snippet.channelTitle,
          channelId: item.snippet.channelId,
          publishedAt: item.snippet.publishedAt,
          viewCount: details?.statistics?.viewCount || '0',
          likeCount: details?.statistics?.likeCount || '0',
          duration: details?.contentDetails?.duration || 'PT0S',
          _notEmbeddable: isNotEmbeddable
        };
      })
      .filter(v => !v._notEmbeddable)
      .map(({ _notEmbeddable, ...rest }) => rest);

    res.json({
      success: true,
      data: {
        items: searchResults,
        nextPageToken: response.data.nextPageToken,
        totalResults: response.data.pageInfo.totalResults
      }
    });

  } catch (error) {
    console.error('YouTube API 호출 오류:', error);
    res.status(500).json({ error: 'YouTube API 호출 중 오류가 발생했습니다.' });
  }
}

// 영상 상세 정보 가져오기
async function getVideoDetails(videoIds) {
  try {
    const response = await axios.get(`${YOUTUBE_API_URL}/videos`, {
      params: {
        part: 'statistics,contentDetails,status',
        id: videoIds,
        key: YOUTUBE_API_KEY
      }
    });
    return response.data.items;
  } catch (error) {
    console.error('영상 상세 정보 조회 오류:', error);
    return [];
  }
}

// 인기 요리 영상 가져오기
router.get('/trending', async (req, res) => {
  try {
    const { maxResults = 20 } = req.query;

    const response = await axios.get(`${YOUTUBE_API_URL}/videos`, {
      params: {
        part: 'snippet,statistics,status',
        chart: 'mostPopular',
        videoCategoryId: '26', // People & Blogs
        regionCode: 'KR',
        maxResults: Math.min(parseInt(maxResults), 50),
        key: YOUTUBE_API_KEY
      }
    });

    const trendingVideos = response.data.items
      .map(item => {
        const isNotEmbeddable = item.status?.embeddable === false;
        return {
          videoId: item.id,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
          channelTitle: item.snippet.channelTitle,
          channelId: item.snippet.channelId,
          publishedAt: item.snippet.publishedAt,
          viewCount: item.statistics.viewCount,
          likeCount: item.statistics.likeCount,
          _notEmbeddable: isNotEmbeddable
        };
      })
      .filter(v => !v._notEmbeddable)
      .map(({ _notEmbeddable, ...rest }) => rest);

    res.json({
      success: true,
      data: {
        items: trendingVideos
      }
    });

  } catch (error) {
    console.error('인기 영상 조회 오류:', error);
    res.status(500).json({ error: '인기 영상 조회 중 오류가 발생했습니다.' });
  }
});

module.exports = router;



