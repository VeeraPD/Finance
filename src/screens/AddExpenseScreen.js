import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useExpenses } from '../contexts/ExpenseContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const AddExpenseScreen = ({ navigation }) => {
  const { categories, addExpense, isLoading } = useExpenses();

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  useEffect(() => {
    if (categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  const handleSubmit = async () => {
    if (!amount || isNaN(parseFloat(amount))) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }
    if (!categoryId) {
      Alert.alert('Error', 'Please select a category');
      return;
    }
    const expenseData = {
      amount: parseFloat(amount),
      description,
      category_id: categoryId,
      date,
    };
    const success = await addExpense(expenseData);
    if (success) {
      Alert.alert('Success', 'Expense added successfully');
      setAmount('');
      setDescription('');
      navigation.navigate('Dashboard');
    }
  };

  const handleDateSelect = (selectedDate) => {
    setDate(selectedDate);
    setShowDatePicker(false);
  };

  const generateDateButtons = () => {
    const dates = [];
    const today = new Date();
    for (let i = 7; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      dates.push(date);
    }
    return dates.map((date) => {
      const dateString = date.toISOString().split('T')[0];
      const isSelected = dateString === date;
      const day = date.getDate();
      let dayLabel;
      if (day === today.getDate()) {
        dayLabel = 'Today';
      } else if (day === today.getDate() - 1) {
        dayLabel = 'Yesterday';
      } else {
        dayLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      return (
        <TouchableOpacity
          key={dateString}
          style={[
            styles.dateButton,
            isSelected && styles.selectedDateButton
          ]}
          onPress={() => handleDateSelect(dateString)}
        >
          <Text style={[
            styles.dateButtonText,
            isSelected && styles.selectedDateButtonText
          ]}>
            {dayLabel}
          </Text>
        </TouchableOpacity>
      );
    });
  };

  const selectedDate = date;
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  const selectedCategory = categories.find(cat => cat.id === categoryId);
  const categoryName = selectedCategory ? selectedCategory.name : 'Select Category';

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.formContainer}>
            <Text style={styles.title}>Add New Expense</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Amount</Text>
              <View style={styles.amountInputContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.amountInput}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor="#A1A1AA"
                />
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={styles.input}
                value={description}
                onChangeText={setDescription}
                placeholder="What was this expense for?"
                placeholderTextColor="#A1A1AA"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category</Text>
              <TouchableOpacity style={styles.pickerButton} onPress={() => setShowCategoryPicker(true)}>
                <Text style={styles.pickerButtonText}>{categoryName}</Text>
                <Ionicons name="chevron-down" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date</Text>
              <TouchableOpacity style={styles.pickerButton} onPress={() => setShowDatePicker(true)}>
                <Text style={styles.pickerButtonText}>{formattedDate}</Text>
                <Ionicons name="calendar-outline" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitButtonText}>Add Expense</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Modal visible={showDatePicker} transparent={true} animationType="slide" onRequestClose={() => setShowDatePicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateButtonsContainer}>
              {generateDateButtons()}
            </ScrollView>
            <TouchableOpacity style={styles.calendarButton} onPress={() => setShowDatePicker(false)}>
              <Ionicons name="calendar-outline" size={20} color="#4F46E5" />
              <Text style={styles.calendarButtonText}>Open Calendar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal visible={showCategoryPicker} transparent={true} animationType="slide" onRequestClose={() => setShowCategoryPicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            <Picker
              selectedValue={categoryId}
              onValueChange={(itemValue) => {
                setCategoryId(itemValue);
                setShowCategoryPicker(false);
              }}
            >
              {categories.map((category) => (
                <Picker.Item key={category.id} label={category.name} value={category.id} />
              ))}
            </Picker>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // ... (keep existing styles unchanged)
});

export default AddExpenseScreen;
