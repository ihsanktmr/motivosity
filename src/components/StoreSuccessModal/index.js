import React, { Component } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableHighlight,
  Linking,
  Clipboard
} from 'react-native'

import { avatarBaseUrl } from '../../utils/images'

import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons'

import HTMLView from 'react-native-htmlview'

import Toast, {DURATION} from 'react-native-easy-toast'

export default class StoreSuccessModal extends Component {

  detectSuccessMessage(data){
    switch (data.redemptionInstructions.inventoryType) {
      case 'TANGO':
        return (
          <View style={{width:'100%'}}>
            <View style={{borderBottomWidth: 1,paddingBottom:20,borderBottomColor: '#FFFFFF',width:'100%'}}>
              {
                data.redemptionInstructions.orderCredential.length > 1 ?
                <View style={{width:'100%'}}>
                  <Text style={styles.claimTitle}>PIN: {data.redemptionInstructions.orderCredential[0].value}</Text>
                  <Text style={styles.claimCode}>Serial Number: {data.redemptionInstructions.orderCredential[1].value}</Text>
                  <View style={styles.codeWrapper}>
                    <View style={{flex:0}}>
                      <Text style={styles.claimCode}>{data.redemptionInstructions.orderCredential[0].value}</Text>
                    </View>
                    <View style={{flex:0,alignSelf:'flex-start',marginLeft:5}}>
                      <TouchableHighlight 
                        underlayColor='transparent'
                        onPress={() => 
                        {Clipboard.setString(data.redemptionInstructions.orderCredential[0].value)
                        setTimeout(() => {this.refs.toast.show('Copied to Clipboard')},250)}}>
                        <MaterialIcon 
                          name='content-copy'
                          size={20}
                          color='#FFFFFF'
                        />
                      </TouchableHighlight>
                    </View>  
                  </View>
                </View>
                : 
                <View>
                  {
                  !data.redemptionInstructions.orderCredential.length ? 
                    null
                  :  
                  <View>
                    <Text style={styles.claimTitle}>Gift Card Claim Code</Text>
                    <View style={styles.codeWrapper}>
                    <View style={{flex:0}}>
                      <Text style={styles.claimCode}>{data.redemptionInstructions.orderCredential[0].value}</Text>
                    </View>
                    <View style={{flex:0,alignSelf:'flex-start',marginLeft:5}}>
                      <TouchableHighlight 
                        underlayColor='transparent'
                        style={{borderWidth:1,borderRadius: 20,padding:5,borderColor: '#FFFFFF'}}
                        onPress={() => 
                        {Clipboard.setString(data.redemptionInstructions.orderCredential[0].value)
                        setTimeout(() => {this.refs.toast.show('Copied to Clipboard')},250)}}>
                        <MaterialIcon 
                          name='content-copy'
                          size={20}
                          color='#FFFFFF'
                        />
                      </TouchableHighlight>
                    </View>  
                  </View>
                </View>
                }
              </View>
              }
            </View>
            <Text
              style={{color:'#FFFFFF',fontSize:20,marginBottom: 50,marginTop: 20,textAlign:'center'}}>
              Redemption Instructions:
            </Text>
            <HTMLView
             value={data.redemptionInstructions.redemptionInstructions}
             addLineBreaks={false}
             stylesheet={redeemInstructions}
           />
        </View>
        )
        break;
      case 'CHRTY':
        return (
          <Text style={{color:'#FFFFFF'}}>
            Thank you for your donation of
            ${data.redemptionInstructions.orderCashValue } to {data.selectedItem.name}.
            Your efforts have helped raise ${data.redemptionInstructions.totalDonation}.
          </Text>
        )
        break;
      case 'LOCAL':
        return (
          <Text style={{color:'#FFFFFF'}}>
            This item is managed by {data.selectedItem.ownerName}.
            You both will receive a confirmation of this order.
          </Text>
        )
        break;
      default:
      break
    }
  }

  render() {
    const {
      data,
      closeModal
    } = this.props
    return (
        <ScrollView style={{backgroundColor: '#61c7e7',paddingHorizontal: 20}}>
            <View style={styles.imageWrapper}>
              {                 
                <Image
                  style={styles.itemImage}
                  source={[{uri: avatarBaseUrl + data.selectedItem.imageUrl}]}
                />
              }
            </View>
            <View style={styles.amountWrapper}>
                <Text style={styles.amountTitle}>Amount</Text>
                <Text style={styles.amountText}>{data.currencySymbol}{data.purchasedAmount}{" " + data.currencyCode}</Text>
                <Text style={styles.moreInfo}>You will receive an email with this information</Text>
            </View>
            <View style={styles.redeemWrapper}>
                {
                data.redemptionInstructions.redemptionUrl ?
                (
                  <View style={!data.redemptionInstructions.orderCredential.length ?  [{marginBottom: 0}] : [{marginBottom: 45}]}>
                    <TouchableHighlight
                      onPress={() => Linking.openURL(data.redemptionInstructions.redemptionUrl )}
                      underlayColor='transparent'
                      style={styles.redeemBtn}
                    >
                        <Text style={{textAlign: 'center',color:'#61c7e7'}}>Click Here To Redeem</Text>
                    </TouchableHighlight>
                  </View>
                )
                : null
                }
                {
                this.detectSuccessMessage(data)
                }
            </View>
            <TouchableHighlight
              onPress={() => closeModal()}
              style={styles.closeButtonWrapper}
              underlayColor='#FFFFFF'
            >
             <Text style={styles.closeButton}>Close</Text>
            </TouchableHighlight>
            <Toast ref="toast"/>
        </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
    imageWrapper: {
        alignSelf: 'center',
        marginTop: 85,
        shadowOffset:{width: 0, height: 1},
        shadowColor: 'black',
        shadowOpacity: 0.5,
        shadowRadius: 4,
        borderRadius: 4
      },
      itemImage: {
        backgroundColor: '#FFFFFF',
        borderRadius: 4,
        width: 130,
        height: 80
      },
      amountWrapper: {
        alignSelf: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#FFFFFF',
        width:'100%',
        paddingHorizontal: 60,
        paddingVertical: 20
      },
      amountTitle: {
        textAlign: 'center',
        fontSize: 22,
        color: '#FFFFFF',
      },
      amountText: {
        textAlign: 'center',
        fontSize: 30,
        color: '#FFFFFF',
        marginBottom: 30
      },
      moreInfo: {
        textAlign: 'center',
        fontSize: 18,
        color: '#FFFFFF',
        marginTop: -15
      },
      claimTitle: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '300',
        textAlign: 'center',
        fontWeight: '900',
        marginBottom: 5
      },
      claimCode: {
        color: '#FFFFFF',
        textAlign: 'center',
        fontWeight: '300',
      },
      codeWrapper: {
        alignItems:'center',
        flexDirection:'row',
        justifyContent:'center',
        marginTop:-5,
        marginBottom:-5
      },
      redeemWrapper: {
        alignSelf: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#FFFFFF',
        width:'100%',
        paddingVertical: 20,
      },
      redeemInstructions: {
        color: '#FFFFFF',
        textAlign: 'center'
      },
      closeButtonWrapper: {
        marginTop: 10,
        marginBottom: 20,
        paddingHorizontal: 10,
        paddingVertical: 5,
        width: 80,
        alignSelf: 'center',
        borderRadius: 5,
        backgroundColor: '#FFFFFF'
      },
      closeButton: {
        color: '#61c7e7',
        textAlign: 'center',
        fontSize: 18
      },
      redeemBtn: {
        shadowOpacity: 0.3,
        shadowRadius: 3,
        shadowOffset: {
        height: 0,
        width: 0
        },
        padding: 10,
        width:'70%',
        alignSelf:'center',
        backgroundColor:'#FFFFFF',
        borderRadius: 5
      }
})

const redeemInstructions = StyleSheet.create({
    p: {
      color: '#FFFFFF',
      textAlign: 'center',
      marginTop: -25
    },
    a: {
      fontWeight: 'bold',
      color: '#FFFFFF',
      fontFamily: 'Lato-Bold'
    },
    ol: {
      color: '#FFFFFF',
      marginTop: 0,
      marginBottom: -30,
      marginTop: -40
    },
    li: {
      marginBottom: -20
    }
  })