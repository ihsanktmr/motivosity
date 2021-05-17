import React, { Component } from "react";
import { TouchableHighlight, StyleSheet, View, Text } from "react-native";

import CustomIcon from "../../config/icons";
import Image from "react-native-remote-svg";

export default class Plus1Icon extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { imageUrl, plus1s, textColor, onPress } = this.props;
    return (
      <TouchableHighlight underlayColor="transparent" onPress={() => onPress()}>
        <View style={styles.plus1Wrapper}>
          {/* <Image
                    source={imageUrl}
                    style={styles.plus1Icon}
                /> */}
          <CustomIcon
            name={imageUrl}
            color={textColor}
            size={16}
            style={styles.likeIcon}
          />
          <Text style={[styles.plus1Number, { color: textColor }]}>
            {" "}
            {plus1s}
          </Text>
        </View>
      </TouchableHighlight>
    );
  }
}

const styles = StyleSheet.create({
  plus1Wrapper: {
    flexDirection: "row",
    marginLeft: 20,
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  plus1Icon: {
    height: 15,
    width: 15
  },
  plus1Number: {
    fontSize: 13,
    marginLeft: 3
  }
});
