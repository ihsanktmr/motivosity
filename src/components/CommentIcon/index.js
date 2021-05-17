import React, { Component } from "react";
import { View, Text, StyleSheet, TouchableHighlight } from "react-native";
import CustomIcon from "../../config/icons";
import Image from "react-native-remote-svg";

export default class CommentIcon extends Component {
  constructor() {
    super();
  }

  render() {
    const { imageUrl, textColor, comments, onPress } = this.props;
    return (
      <TouchableHighlight underlayColor="transparent" onPress={() => onPress()}>
        <View style={styles.commentIconWrapper}>
          <CustomIcon
            name={imageUrl}
            color={textColor}
            size={16}
            style={styles.likeIcon}
          />
          {/* <Image source={imageUrl} style={styles.commentIcon} /> */}
          <Text style={[styles.commentsNumber, { color: textColor }]}>
            {" "}
            {comments}
          </Text>
        </View>
      </TouchableHighlight>
    );
  }
}

const styles = StyleSheet.create({
  commentIconWrapper: {
    flexDirection: "row",
    marginLeft: 20,
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  commentIcon: {
    height: 15,
    width: 15
  },
  commentsNumber: {
    fontSize: 13,
    marginLeft: 3
  }
});
