import React, { Component } from 'react'
import {
  StyleSheet,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  KeyboardAvoidingView,
  Platform
} from 'react-native'

import SurveyQuestion from '../SurveyQuestion'

export default class SurveyModal extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
        surveyModalOpen: props.showModal,
        note: '',
        error: ''
    }
  }

  componentDidMount(){
    this.props.data.questions ?
      this.props.data.questions.map((score,index) => {
          this.setState({
            [`q${index + 1}Score`]: null
          })
      }) : null
  }

  validate(data){
    if(Object.values(data).every(o => o !== null))
    {
        this.setState({
            surveyModalOpen: false
        },() => this.props.submitSurvey(data))
    }
       else {
        this.setState({
            error:'Please answer all the questions'
        })
       }
  }

  handleValueChange(qScoreColor, qScore, score){
    colors = [
        'rgb(205, 80, 90)',
        'rgb(215, 119, 130)',
        'rgb(231, 159, 161)',
        'rgb(244, 169, 171)',
        'rgb(255, 209, 210)',
        'rgb(255, 231, 233)',
        'rgb(223, 224, 61)',
        'rgb(242, 238, 123)',
        'rgb(201, 235, 159)',
        'rgb(182, 218, 125)'
        ]
    var selectedColor;
    colors.map((color, index) => {
        index === score - 1 ? selectedColor = color : null
    })
    this.setState({
        [qScore]: score,
        [qScoreColor]: selectedColor
    })
  }

  render () {
    return this.props.data.questions ? (
         <Modal
            visible={this.state.surveyModalOpen}
            animationType='slide'
            onRequestClose={() => this.modalVisibility()}
        >
            <KeyboardAvoidingView
                style={{flex:1}}
                behavior="padding"
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -500}
            >
            <ScrollView style={{flex:1,marginTop:30}}>
                <View style={styles.surveyWrapper}>
                <View style={styles.surveyTitleWrapper}>
                    <Text style={styles.surveyTitle}>{this.props.data.overviewText}</Text>
                    <Text style={styles.surveySubTitle}>This quaterly survey is anonymous. Thanks for your participation</Text>
                    <View style={styles.header}>
                        <Text style={styles.txt}>Disagree</Text>
                        <Text style={styles.txt}>Agree</Text>
                    </View>
                </View>
                {
                    this.props.data.questions.map((question,index) => {
                        return (
                        <SurveyQuestion
                            key={index + 1}
                            index={index + 1}
                            question={question}
                            handleValueChange={(qScoreColor,qScore,q2ScoreNumber) => this.handleValueChange(qScoreColor,qScore,q2ScoreNumber)}
                            state={this.state}
                        />
                        )
                    })
                }
                <TextInput
                    multiline
                    numberOfLines={3}
                    style={styles.note}
                    placeholder='Add anonymous feedback here...'
                    onChangeText={(note) => this.setState({note})}
                    underlineColorAndroid='rgba(0,0,0,0)'
                />
                {this.state.error ? <Text style={styles.error}>{this.state.error}</Text> : null}
                </View>
                <View style={styles.buttonsContainer}>
                    <TouchableOpacity
                        onPress={() => this.setState({surveyModalOpen: false},() => this.props.snoozeSurvey())}
                        style={styles.buttonSnooze}
                    >
                        <Text style={{color:'#FFFFFF',fontSize:20}}>Snooze for 3 days</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={(data) => this.validate(this.state)}
                        style={styles.buttonSubmit}
                    >
                        <Text style={{color:'#FFFFFF',fontSize:20}}>Submit</Text>
                    </TouchableOpacity>
                    
                </View>
            </ScrollView>
            </KeyboardAvoidingView>
        </Modal>
    ) : null
  }
}

const styles = StyleSheet.create({
    surveyWrapper:{
        flex:1,
        paddingVertical:50,
        paddingHorizontal: 20
    },
    surveyTitleWrapper: {
        borderBottomWidth: 1,
        borderColor: '#DADADA',
        marginBottom: 10
    },
    surveyTitle: {
        fontSize:16,
        fontFamily: 'Lato-Bold',
        textAlign: 'center'
    },
    surveySubTitle: {
        fontSize: 14,
        fontFamily: 'Lato-Light',
        color: '#444444',
        marginTop: 10,
        textAlign: 'center'
    },
    header: {
        width: '100%',
        height: 40,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        backgroundColor: '#57BFE3',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        marginTop: 7
    },
    txt: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Lato-Bold'
    },
    note: {
        borderWidth: 1,
        borderColor: '#DADADA',
        borderRadius: 5,
        height: 80,
        fontSize: 14,
        paddingLeft: 10,
        marginTop: 5,
        textAlignVertical: 'top'
    },
    buttonsContainer: {
        justifyContent:'space-between',
        flexDirection:'row',
        marginHorizontal:20,
        marginBottom: 30
    },
    buttonSnooze:{
        flex:0,
        backgroundColor:'#212121',
        padding:10,
        borderRadius: 5
    },
    buttonSubmit: {
        flex:0,
        backgroundColor:'#57BFE3',
        padding:10,
        borderRadius: 5
    },
    error: {
        color: '#D50048',
        fontSize: 16,
        marginTop: 5
    }
})