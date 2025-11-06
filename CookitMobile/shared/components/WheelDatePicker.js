// 스크롤 휠 방식 날짜 선택기
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const ITEM_HEIGHT = 40;
const VISIBLE_ITEMS = 5;

const WheelDatePicker = ({ onDateChange, initialDate }) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const currentDay = currentDate.getDate();

  // initialDate가 있으면 파싱, 없으면 오늘 날짜
  const parseInitialDate = () => {
    if (initialDate) {
      const separator = initialDate.includes('/') ? '/' : '-';
      const parts = initialDate.split(separator);
      if (parts.length >= 3) {
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]);
        const day = parseInt(parts[2]);
        if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
          return { year, month, day };
        }
      }
    }
    return {
      year: currentYear,
      month: currentMonth,
      day: currentDay
    };
  };

  const initial = parseInitialDate();
  const [selectedYear, setSelectedYear] = useState(initial.year);
  const [selectedMonth, setSelectedMonth] = useState(initial.month);
  const [selectedDay, setSelectedDay] = useState(initial.day);

  const yearScrollRef = useRef(null);
  const monthScrollRef = useRef(null);
  const dayScrollRef = useRef(null);
  
  // 스크롤 중인지 추적하는 플래그 (중복 호출 방지)
  const isScrollingRef = useRef({
    year: false,
    month: false,
    day: false
  });
  
  // 스크롤 타이머 저장 (정리용)
  const scrollTimersRef = useRef({
    year: null,
    month: null,
    day: null
  });

  // 년도 리스트 (현재 년도부터 +10년까지)
  const years = Array.from({ length: 11 }, (_, i) => currentYear + i);
  
  // 월 리스트
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  
  // 해당 년월의 일수 계산
  const getDaysInMonth = (year, month) => {
    return new Date(year, month, 0).getDate();
  };

  const days = Array.from({ length: getDaysInMonth(selectedYear, selectedMonth) }, (_, i) => i + 1);

  // 월이나 년이 변경되면 일(day) 자동 조정 및 스크롤 위치 업데이트
  useEffect(() => {
    const maxDays = getDaysInMonth(selectedYear, selectedMonth);
    if (selectedDay > maxDays) {
      // 선택한 일이 해당 월의 최대 일수보다 크면 최대 일수로 조정
      const adjustedDay = maxDays;
      setSelectedDay(adjustedDay);
      
      // 스크롤 위치도 업데이트 (스크롤 중이 아닐 때만)
      if (dayScrollRef.current && !isScrollingRef.current.day) {
        const dayIndex = adjustedDay - 1;
        if (scrollTimersRef.current.day) {
          clearTimeout(scrollTimersRef.current.day);
        }
        scrollTimersRef.current.day = setTimeout(() => {
          dayScrollRef.current?.scrollTo({
            y: dayIndex * ITEM_HEIGHT,
            animated: true
          });
        }, 150);
      }
    }
  }, [selectedYear, selectedMonth]);

  // 날짜 변경 시 부모 컴포넌트에 알림
  useEffect(() => {
    const maxDays = getDaysInMonth(selectedYear, selectedMonth);
    const adjustedDay = selectedDay > maxDays ? maxDays : selectedDay;
    const formattedDate = `${selectedYear}/${String(selectedMonth).padStart(2, '0')}/${String(adjustedDay).padStart(2, '0')}`;
    onDateChange(formattedDate);
  }, [selectedYear, selectedMonth, selectedDay]);

  const handleScrollEnd = (event, type, items) => {
    const scrollRef = type === 'year' ? yearScrollRef : type === 'month' ? monthScrollRef : dayScrollRef;
    if (!scrollRef.current) return;
    
    // 이미 스크롤 중이면 무시 (중복 호출 방지)
    if (isScrollingRef.current[type]) {
      return;
    }
    
    // 이전 타이머 정리
    if (scrollTimersRef.current[type]) {
      clearTimeout(scrollTimersRef.current[type]);
    }
    
    isScrollingRef.current[type] = true;
    
    const offsetY = event.nativeEvent.contentOffset.y;
    
    // 정확한 인덱스 계산 (ITEM_HEIGHT로 나누어 가장 가까운 정수로 반올림)
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, items.length - 1));
    
    // 선택된 값 즉시 업데이트
    const selectedValue = items[clampedIndex];
    if (type === 'year') {
      setSelectedYear(selectedValue);
    } else if (type === 'month') {
      setSelectedMonth(selectedValue);
    } else if (type === 'day') {
      setSelectedDay(selectedValue);
    }
    
    // 스크롤 위치를 정확히 맞춤
    scrollTimersRef.current[type] = setTimeout(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        y: clampedIndex * ITEM_HEIGHT,
        animated: true
      });
      
        // 스크롤 완료 후 플래그 해제
      setTimeout(() => {
          isScrollingRef.current[type] = false;
        }, 300);
    } else {
        isScrollingRef.current[type] = false;
      }
    }, 100);
  };

  const scrollToIndex = (index, type, item) => {
    const scrollRef = type === 'year' ? yearScrollRef : type === 'month' ? monthScrollRef : dayScrollRef;
    if (scrollRef.current && index >= 0) {
      // 이전 타이머 정리
      if (scrollTimersRef.current[type]) {
        clearTimeout(scrollTimersRef.current[type]);
      }
      
      isScrollingRef.current[type] = true;
      
      scrollRef.current.scrollTo({
        y: index * ITEM_HEIGHT,
        animated: true
      });
      
      // 선택된 값 즉시 업데이트
        if (type === 'year') {
          setSelectedYear(item);
        } else if (type === 'month') {
          setSelectedMonth(item);
        } else if (type === 'day') {
          setSelectedDay(item);
        }
      
      // 스크롤 완료 후 플래그 해제
      scrollTimersRef.current[type] = setTimeout(() => {
        isScrollingRef.current[type] = false;
      }, 300);
    }
  };

  const renderPickerItems = (items, selectedItem, type) => {
    const scrollRef = type === 'year' ? yearScrollRef : type === 'month' ? monthScrollRef : dayScrollRef;
    
    return (
      <View style={styles.pickerColumn}>
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          snapToAlignment="start"
          decelerationRate={0.9}
          onMomentumScrollEnd={(e) => {
            // onScrollEndDrag와 중복 호출 방지
            if (!isScrollingRef.current[type]) {
              handleScrollEnd(e, type, items);
            }
          }}
          onScrollEndDrag={(e) => {
            // onMomentumScrollEnd와 중복 호출 방지
            if (!isScrollingRef.current[type]) {
              handleScrollEnd(e, type, items);
            }
          }}
          contentContainerStyle={{
            paddingTop: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
            paddingBottom: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2)
          }}
          nestedScrollEnabled={true}
          bounces={false}
          scrollEventThrottle={16}
        >
          {items.map((item, index) => {
            const isSelected = item === selectedItem;
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.pickerItem,
                  isSelected && styles.pickerItemSelected
                ]}
                onPress={() => scrollToIndex(index, type, item)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.pickerText,
                  isSelected && styles.pickerTextSelected
                ]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <Text style={styles.unitText}>
          {type === 'year' ? '년' : type === 'month' ? '월' : '일'}
        </Text>
      </View>
    );
  };

  // initialDate가 변경되면 날짜 업데이트
  useEffect(() => {
    if (initialDate) {
      const separator = initialDate.includes('/') ? '/' : '-';
      const parts = initialDate.split(separator);
      if (parts.length >= 3) {
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]);
        const day = parseInt(parts[2]);
        if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
          // 스크롤 중이 아닐 때만 업데이트
          if (!isScrollingRef.current.year && !isScrollingRef.current.month && !isScrollingRef.current.day) {
            setSelectedYear(year);
            setSelectedMonth(month);
            setSelectedDay(day);
          }
        }
      }
    }
  }, [initialDate]);

  // 초기 스크롤 위치 설정 및 날짜 변경 시 스크롤 업데이트
  useEffect(() => {
    const setScrollPosition = () => {
      const yearIndex = years.indexOf(selectedYear);
      const monthIndex = months.indexOf(selectedMonth);
      const maxDays = getDaysInMonth(selectedYear, selectedMonth);
      const adjustedDay = selectedDay > maxDays ? maxDays : selectedDay;
      const dayIndex = adjustedDay - 1;

      if (yearScrollRef.current && yearIndex >= 0) {
        yearScrollRef.current.scrollTo({ 
          y: yearIndex * ITEM_HEIGHT, 
          animated: false 
        });
      }
      if (monthScrollRef.current && monthIndex >= 0) {
        monthScrollRef.current.scrollTo({ 
          y: monthIndex * ITEM_HEIGHT, 
          animated: false 
        });
      }
      if (dayScrollRef.current && dayIndex >= 0 && dayIndex < days.length) {
        dayScrollRef.current.scrollTo({ 
          y: dayIndex * ITEM_HEIGHT, 
          animated: false 
        });
      }
    };
    
    // 약간의 지연을 두어 ref가 준비될 때까지 대기
    const timer = setTimeout(setScrollPosition, 100);
    return () => clearTimeout(timer);
  }, [selectedYear, selectedMonth, selectedDay, days.length]);

  return (
    <View style={styles.container}>
      <View style={styles.pickerContainer}>
        {renderPickerItems(years, selectedYear, 'year')}
        {renderPickerItems(months, selectedMonth, 'month')}
        {renderPickerItems(days, selectedDay, 'day')}
      </View>
      <View style={styles.selectionIndicator} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    position: 'relative',
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: '100%',
  },
  pickerColumn: {
    flex: 1,
    height: '100%',
    position: 'relative',
  },
  pickerItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerItemSelected: {
    // 선택된 아이템 스타일
  },
  pickerText: {
    fontSize: 18,
    color: '#999',
  },
  pickerTextSelected: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF8C00',
  },
  unitText: {
    position: 'absolute',
    right: 20,
    top: '50%',
    marginTop: -10,
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  selectionIndicator: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    marginTop: -ITEM_HEIGHT / 2,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#FF8C00',
    backgroundColor: 'rgba(255, 140, 0, 0.05)',
    pointerEvents: 'none',
  },
});

export default WheelDatePicker;

