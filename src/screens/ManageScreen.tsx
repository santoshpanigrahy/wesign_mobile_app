import { Button, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import BottomSheet from '@components/BottomSheet';

const ManageScreen = () => {
  const [open, setOpen] = useState(false);
  return (
    <View style={{flex:1}}>
     <Text>Hello</Text>
    </View>
  )
}

export default ManageScreen

const styles = StyleSheet.create({})