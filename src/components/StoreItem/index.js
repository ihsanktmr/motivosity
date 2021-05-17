import React, { Component } from 'react'
import {
  Image,
  View,
  StyleSheet,
  TouchableHighlight
} from 'react-native'

import { avatarBaseUrl } from '../../utils/images'

export default class StoreItem extends Component {
  constructor() {
    super()
  }

  render() {
    const {
      data,
      device,
      onPress
    } = this.props
    return (
      <TouchableHighlight
        underlayColor='transparent'
        onPress={() => onPress(data)}
      >
        <View style={device === 'Tablet'? 
                    [styles.itemWrapper,{ marginRight: 13}] 
                    : [styles.itemWrapper,{ marginRight: 0}]
                    }
        >
        <Image
          style={styles.storeItem}
          source={{uri: avatarBaseUrl + data.imageUrl}}
          resizeMode="contain"
        />
        </View>
      </TouchableHighlight>
    )
  }
}

const styles = StyleSheet.create({
  itemWrapper: {
    marginBottom: 10,
    borderColor: '#BFBFBF',
    marginRight: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    overflow: 'hidden',
  },
  storeItem: {
    width: 100,
    height: 65,
  }
})