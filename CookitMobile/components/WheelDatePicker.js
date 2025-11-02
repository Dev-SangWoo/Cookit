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

  // initialDate가 있으면 파싱, 없으면 현재 날짜
  const parseInitialDate = () => {
    if (initialDate) {
      const [year, month, day] = initialDate.split('/');
      return {
        year: parseInt(year),
        month: parseInt(month),
        day: parseInt(day)
      };
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

  // 년도 리스트 (현재 년도부터 +10년까지)
  const years = Array.from({ length: 11 }, (_, i) => currentYear + i);
  
  // 월 리스트
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  
  // 해당 년월의 일수 계산
  const getDaysInMonth = (year, month) => {
    return new Date(year, month, 0).getDate();
  };

  const days = Array.from({ length: getDaysInMonth(selectedYear, selectedMonth) }, (_, i) => i + 1);

  // 날짜 변경 시 부모 컴포넌트에 알림
  useEffect(() => {
    // 선택한 날짜가 해당 월의 마지막 날보다 크면 조정
    const maxDays = getDaysInMonth(selectedYear, selectedMonth);
    const adjustedDay = selectedDay > maxDays ? maxDays : selectedDay;
    
    if (adjustedDay !== selectedDay) {
      setSelectedDay(adjustedDay);
    }

    const formattedDate = `${selectedYear}/${String(selectedMonth).padStart(2, '0')}/${String(adjustedDay).padStart(2, '0')}`;
    onDateChange(formattedDate);
  }, [selectedYear, selectedMonth, selectedDay]);

  const handleScrollEnd = (event, type, items) => {
    const scrollRef = type === 'year' ? yearScrollRef : type === 'month' ? monthScrollRef : dayScrollRef;
    const offsetY = event.nativeEvent.contentOffset.y;
    
    // padding을 고려한 정확한 인덱스 계산
    const paddingTop = ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2);
    const adjustedOffsetY = offsetY;
    const index = Math.round(adjustedOffsetY / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, items.length - 1));
    
    // 가장 가까운 항목으로 스크롤 이동
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        y: clampedIndex * ITEM_HEIGHT,
        animated: true
      });
      
      // 스크롤 완료 후 선택된 값 업데이트
      setTimeout(() => {
        if (type === 'year') {
          setSelectedYear(items[clampedIndex]);
        } else if (type === 'month') {
          setSelectedMonth(items[clampedIndex]);
        } else if (type === 'day') {
          setSelectedDay(items[clampedIndex]);
        }
      }, 100);
    } else {
      // ref가 아직 없으면 바로 업데이트
      if (type === 'year') {
        setSelectedYear(items[clampedIndex]);
      } else if (type === 'month') {
        setSelectedMonth(items[clampedIndex]);
      } else if (type === 'day') {
        setSelectedDay(items[clampedIndex]);
      }
    }
  };

  const scrollToIndex = (index, type, item) => {
    const scrollRef = type === 'year' ? yearScrollRef : type === 'month' ? monthScrollRef : dayScrollRef;
    if (scrollRef.current) {
      const paddingTop = ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2);
      scrollRef.current.scrollTo({
        y: index * ITEM_HEIGHT,
        animated: true
      });
      
      // 선택된 값도 업데이트
      setTimeout(() => {
        if (type === 'year') {
          setSelectedYear(item);
        } else if (type === 'month') {
          setSelectedMonth(item);
        } else if (type === 'day') {
          setSelectedDay(item);
        }
      }, 100);
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
          snapToAlignment="center"
          decelerationRate="fast"
          onMomentumScrollEnd={(e) => handleScrollEnd(e, type, items)}
          onScrollEndDrag={(e) => handleScrollEnd(e, type, items)}
          contentContainerStyle={{
            paddingVertical: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2)
          }}
          nestedScrollEnabled={true}
          bounces={true}
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

  // 초기 스크롤 위치 설정
  useEffect(() => {
    const setInitialScroll = () => {
      const yearIndex = years.indexOf(selectedYear);
      const monthIndex = months.indexOf(selectedMonth);
      const maxDays = getDaysInMonth(selectedYear, selectedMonth);
      const adjustedDay = selectedDay > maxDays ? maxDays : selectedDay;
      const dayIndex = days.indexOf(adjustedDay) >= 0 ? days.indexOf(adjustedDay) : adjustedDay - 1;

      if (yearScrollRef.current && yearIndex >= 0) {
        const paddingTop = ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2);
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
      if (dayScrollRef.current && dayIndex >= 0) {
        dayScrollRef.current.scrollTo({ 
          y: dayIndex * ITEM_HEIGHT, 
          animated: false 
        });
      }
    };
    
    setTimeout(setInitialScroll, 200);
  }, []);

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

