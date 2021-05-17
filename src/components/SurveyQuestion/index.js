import React, { Component } from 'react'
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  Platform
} from 'react-native'

import Slider from "react-native-slider"
import HTMLView from 'react-native-htmlview'


export default class SurveyQuestion extends React.Component {
  constructor(props) {
    super(props)
  }

  render () {
    return(
        <View style={{marginBottom:15}}>
            <HTMLView
                value={`<p>${this.props.question}</p>`}
                stylesheet={stylesSpan}
            />
            <View style={{marginTop: 3}}>
                <Slider
                step={1}
                value={5}
                minimumValue={1}
                maximumValue={10}
                onValueChange={(qScore) => this.props.handleValueChange(`q${this.props.index}ScoreColor`,`q${this.props.index}Score`,qScore)}
                thumbTintColor='#DADADA'
                trackClickable={true}
                thumbTouchSize={{width: 90, height: 90}}
                minimumTrackTintColor='#D4D4D4'
                maximumTrackTintColor='#D4D4D4'
                style={{width: '100%'}}
                trackStyle={{width: '100%', height: 2}}
                customThumb={
                        <View style={this.props.state['q' + this.props.index + 'ScoreColor'] ? [styles.btnStyle,{backgroundColor: this.props.state['q' + this.props.index + 'ScoreColor']}] : styles.btnStyle}>
                            <Text style={styles.scoreNumber}>{this.props.state['q' + this.props.index + 'Score']}</Text>
                        </View>                    
                        }
            />
            </View>
        </View>
    )
  }
}
const styles = StyleSheet.create({
    btnStyle: {
        width:24,
        height:24,
        borderRadius:15,
        padding: -5,
        backgroundColor: '#D4D4D4'
    },
    scoreNumber: {
        fontSize:16,
        textAlign: 'center',
        color: '#FFFFFF',
        fontFamily: 'Lato-Bold',
        paddingTop: 2
    }
})

const stylesSpan = StyleSheet.create({
    span: {
        color: '#57BFE3'
    },
    p: {
        fontSize: 16,
        fontFamily: 'Lato-Bold',
        marginBottom: 2
    }
  });