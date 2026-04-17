import React from 'react';
import { View, TouchableOpacity, Text, ScrollView } from 'react-native';
import {
  PenLine,
  Pencil,
  CalendarDays,
  CheckSquare,
  FileText,
  ChevronDown,
  Signature,
  CaseUpper,
  Stamp,
  User,
  Mail,
  Building2,
  Heading,
  NotepadText,
  SquareCheck,
  SquareChevronDown,
  CircleDot,
  Palette,
  Paperclip
} from 'lucide-react-native';
import { Colors, Fonts, fp, hp, wp } from '@utils/Constants';

const fields = [
  { type: 'my_signature', label: 'Sign', icon: Signature },
  { type: 'my_initial', label: 'Initial', icon: CaseUpper },
  { type: 'my_stamp', label: 'Stamp', icon: Stamp },
  { type: 'my_date_signed', label: 'Date', icon: CalendarDays },
  { type: 'my_full_name', label: 'Name', icon: User },
  { type: 'my_email', label: 'Email', icon: Mail },
  { type: 'my_company', label: 'Company', icon: Building2 },
  //  { type: 'plain_text', label: 'Note', icon: NotepadText },
];

const CanvasPrefilledFields = ({ selectedType, onSelect, selectedRecipient }) => {

  const recpBgColor = Colors.prefilled + "40";
  const recpBorderColor = Colors.prefilled;
  return (
    <View style={{

      backgroundColor: '#fff',
      borderTopWidth: 1,
      paddingVertical: hp(1.5),

      borderColor: '#eee'
    }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: wp(5), paddingHorizontal: wp(5) }}>
        {fields.map((item) => {
          const Icon = item.icon;
          const isActive = selectedType === item.type;

          return (
            <TouchableOpacity
              key={item.type}
              onPress={() => {
                if (selectedType === item.type) {
                  onSelect(null); // toggle OFF
                } else {
                  onSelect(item.type); // toggle ON
                }
              }}
              style={{

                alignItems: 'center',
                justifyContent: 'center',


              }}
            >
              <View style={{
                backgroundColor: isActive ? recpBorderColor : recpBgColor,
                width: wp(14),
                height: wp(14),
                justifyContent: 'center', alignItems: 'center'
              }}>
                <Icon size={20} color={isActive ? '#fff' : '#555'} />
              </View>

              <Text style={{
                fontSize: fp(1.6),
                marginTop: 4,
                fontFamily: Fonts.Regular,
                color: isActive ? "#555" : '#555'
              }}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default CanvasPrefilledFields;