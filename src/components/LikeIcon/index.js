import React, { Component } from "react";
import { View, Text, StyleSheet, TouchableHighlight } from "react-native";

import Image from "react-native-remote-svg";
import CustomIcon from "../../config/icons";

export default class LikeIcon extends Component {
  constructor() {
    super();
  }

  render() {
    const { disabled, imageUrl, textColor, likes, onPress } = this.props;
    return (
      <TouchableHighlight
        disabled={disabled}
        underlayColor="transparent"
        onPress={() => onPress()}
      >
        <View style={styles.likeIconWrapper}>
          {imageUrl == "inactive" ? (
            <CustomIcon
              name="like-inactive"
              color={textColor}
              size={16}
              style={styles.likeIcon}
            />
          ) : (
            <CustomIcon
              name="like-active"
              color={textColor}
              size={16}
              style={styles.likeIcon}
            />
          )}
          {/* <Image source={imageUrl} style={styles.likeIcon} /> */}
          <Text style={[styles.likesNumber, { color: textColor }]}>
            {" "}
            {likes}
          </Text>
        </View>
      </TouchableHighlight>
    );
  }
}

const styles = StyleSheet.create({
  likeIconWrapper: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  likeIcon: {
    height: 15,
    width: 15
  },
  likesNumber: {
    fontSize: 13,
    marginLeft: 3
  }
});
