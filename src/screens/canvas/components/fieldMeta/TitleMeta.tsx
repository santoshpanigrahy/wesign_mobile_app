import { View } from 'react-native'
import React from 'react'

import { hp } from '@utils/Constants'

import AppToggleButton from '@components/AppToggleButton'

const TitleMeta = ({ field, updateFieldValue }) => {

    const isRequired = field?.required_field_checkbox;

    return (
        <View style={{ marginBottom: hp(2.5) }}>
            <AppToggleButton label={'Required'} value={isRequired} onToggle={(val) => {

                updateFieldValue('required_field_checkbox', val)

            }} />


        </View>
    )
}

export default TitleMeta

