import React, { useState } from "react";
import { View, TextInput, StyleSheet, TouchableOpacity, Image } from "react-native";

export default function AppPhoneInput() {
  const [phone, setPhone] = useState("");

  return (
    <View style={styles.container}>

      <View style={styles.inputBox}>


        <TouchableOpacity style={styles.flagContainer}>
          <Image
            source={{ uri: "https://flagcdn.com/w40/us.png" }} // change dynamically later
            style={styles.flag}
          />
        </TouchableOpacity>


        <TextInput
          placeholder="Enter phone number"
          keyboardType="number-pad"
          value={phone}
          onChangeText={(text) =>
            setPhone(text.replace(/[^0-9]/g, ""))
          }
          style={styles.input}
          placeholderTextColor="#999"
        />
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // padding: 16,
  },


  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    height: 55,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 2,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },

  flagContainer: {
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  flag: {
    width: 24,
    height: 16,
    borderRadius: 2,
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
});