import React, { Component } from 'react'
import {
  Image,
  View,
  Text,
  StyleSheet
} from 'react-native'

import GiveNowBtn from  '../../components/GiveNowBtn'
import { avatarBaseUrl } from '../../utils/images'


export default class AwardsCard extends Component {
  constructor() {
    super()
}

  render() {
    const {
      data,
      currencySymbol,
      onPress
    } = this.props
    
    return (
      <View style={styles.awardsCard}>
       <View style={styles.upperSideWrapper}>
         <View style={styles.imageWrapper}>
          <Image
            style={styles.image}
            source={{uri: avatarBaseUrl + data.awardIconURL}}
          />
         </View>
          <View style={styles.info}>
            <Text style={styles.title}>{data.awardName}</Text>
            <Text style={styles.subTitle}>{data.description}</Text>
            {
              data.awardDollars !== 0 ?
              <Text style={styles.price}>{currencySymbol}{data.awardDollars}</Text>
              : null
            }
          </View>
          <Text style={styles.date}>{data.lastAwardedDateReadable}</Text>
        </View>
        <GiveNowBtn 
          data={data} 
          onPress={(selectedAward) => onPress(selectedAward)}
          disabled={false}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
    awardsCard: {
      backgroundColor: '#FFFFFF',
      width: '100%',
      marginBottom: 20,
      paddingHorizontal: 10,
      paddingVertical: 15,
      borderRadius: 3
    },
    upperSideWrapper: {
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    imageWrapper: {
      flex: 0,
      marginRight: 15
    },
    image: {
       width:50,
       height:50,
       borderRadius:5
    },
    info: {
      flex: 1
    },
    price: {
      fontSize: 14,
      fontWeight: '300',
      marginBottom: 3
    },
    title: {
      fontSize: 22,
      fontWeight: 'bold',
      marginBottom: 8
    },
    subTitle: {
      color: '#61c7e7'
    },
    date: {
      fontSize: 12,
      color: '#AAAAAA'
    }
})