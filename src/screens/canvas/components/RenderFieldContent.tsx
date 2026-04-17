import { Colors } from "@utils/Constants";
import { FIELD_CONFIG } from "@utils/fieldConstants";
import { Check } from "lucide-react-native";
import { Image, Text, View } from "react-native";

const RenderFieldContent = ({ field, isSelected, onUpdate }) => {

  const config = FIELD_CONFIG[field.field_name] || {};


  const type = field.field_name;

  switch (type) {
    case "checkbox":
      return (
        <View
          style={{
            width: '100%',
            height: '100%',
            // borderWidth: 2,

            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderStyle: isSelected ? 'dashed' : 'solid',
            borderColor: field?.recipient_color || '#000',
            backgroundColor: field?.recipient_color + '40'

          }}
        >


          {
            field?.is_checked && <Check color={field?.recipient_color} size={8} />
          }

        </View>
      );

    case "radio":
      return (
        <View
          style={{
            width: '100%',
            height: '100%',
            // borderWidth: 2,
            borderRadius: '50%',

            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderStyle: isSelected ? 'dashed' : 'solid',
            borderColor: field?.recipient_color || '#000',
            backgroundColor: field?.recipient_color + '40'

          }}
        >


          {
            field?.is_checked && <Check color={field?.recipient_color} size={8} />
          }

        </View>
      );

    case 'my_date_signed':
    case 'my_full_name':
    case 'my_email':
    case 'my_company':
    case 'full_name':
    case 'email':
      return <Text
        style={{
          fontSize: field.font_size,
          color: isSelected ? field?.recipient_color : '#fff',
          borderWidth: 1,
          borderStyle: isSelected ? 'dashed' : 'solid',
          borderColor: field?.recipient_color || '#000',
          backgroundColor: isSelected
            ? field?.recipient_color + '40'
            : field?.recipient_color,
        }}
      >
        {field?.field_data}
      </Text>


    case "my_signature":
    case "my_initial":
    case "my_stamp":
      return (
        <View style={{
          flex: 1,
          borderWidth: 1,
          borderStyle: isSelected ? 'dashed' : 'solid',
          borderColor: field?.recipient_color || '#000',
          backgroundColor: isSelected
            ? field?.recipient_color + '40'
            : field?.recipient_color
        }} >



          <Image source={{ uri: field.image_base_64 }} style={{ width: '100%', height: '100%', }} resizeMode="contain" onLoad={(e) => {
            const { width, height } = e.nativeEvent.source;

            const imgAR = width / height;
            const boxW = field.width;
            const boxH = field.height;
            const boxAR = boxW / boxH;

            let finalW, finalH;

            if (imgAR > boxAR) {
              finalH = boxH;
              finalW = boxH * imgAR;
            } else {
              finalW = boxW;
              finalH = boxW / imgAR;
            }

            onUpdate(field.id, {
              width: finalW,
              height: finalH,
            });
          }} />

        </View>
      );

    case "plain_text":
      return <Text style={{
        fontSize: field.font_size,
        borderWidth: 1,
        borderStyle: isSelected ? 'dashed' : 'solid',
        borderColor: field?.recipient_color || '#000',
        backgroundColor: isSelected
          ? field?.recipient_color + '40'
          : field?.recipient_color,
        color: isSelected ? field?.recipient_color : '#fff',
      }}>
        {field?.field_data || "Write here"}
      </Text>

    case 'dropdown':
      return (
        <View style={{
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'row',
          flex: 1,
          gap: 5,
          borderWidth: 1,
          borderStyle: isSelected ? 'dashed' : 'solid',
          borderColor: field?.recipient_color || '#000',
          backgroundColor: isSelected
            ? field?.recipient_color + '40'
            : field?.recipient_color,
        }}>
          {config.icon && (
            <config.icon
              size={10}
              color={isSelected ? field.recipient_color : '#fff'}
            />
          )}
          <Text
            style={{
              fontSize: field.font_size,
              color: isSelected ? field.recipient_color : '#fff',
            }}
          >
            {field?.field_data?.split(',')[0]}
          </Text>
        </View>
      );



    default:
      return (
        <View style={{
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'row',
          flex: 1,
          gap: 5,
          borderWidth: 1,
          borderStyle: isSelected ? 'dashed' : 'solid',
          borderColor: field?.recipient_color || '#000',
          backgroundColor: isSelected
            ? field?.recipient_color + '40'
            : field?.recipient_color,
        }}>
          {config.icon && (
            <config.icon
              size={10}
              color={isSelected ? field.recipient_color : '#fff'}
            />
          )}
          <Text
            style={{
              fontSize: field.font_size,
              color: isSelected ? field.recipient_color : '#fff',
            }}
          >
            {config.label}
          </Text>
        </View>
      );
  }
};

export default RenderFieldContent;