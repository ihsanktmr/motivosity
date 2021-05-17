import React, { Component } from "react";
import { Image, Text, View, StyleSheet } from "react-native";

import { avatarBaseUrl } from "../../utils/images";
import CustomIcon from "../../config/icons";

export default class CommentedBox extends Component {
  constructor() {
    super();
  }

  render() {
    const { data } = this.props;
    return (
      <View style={styles.commentsList}>
        <View style={styles.imageWrapper}>
          <Image
            style={styles.commentersImg}
            source={{ uri: avatarBaseUrl + data.user.avatarUrl }}
          />
        </View>
        <View style={styles.textWrapper}>
          <View style={{ flexDirection: "row" }}>
            <Text style={styles.commentersName}>{data.user.fullName}</Text>
            <Text style={styles.commentDate}>({data.readableCreatedDate})</Text>
            {data.type === "ADDN" ? (
              <View style={styles.plus1Wrapper}>
                <Image
                  style={styles.plus1Img}
                  source={require("../../assets/images/add-buck.png")}
                />
              </View>
            ) : null}
          </View>
          <Text style={styles.commentersText}>{data.commentText}</Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  commentsList: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 10,
    paddingLeft: 20
  },
  imageWrapper: {
    flex: 0
  },
  commentersImg: {
    height: 35,
    width: 35,
    borderRadius: 3
  },
  textWrapper: {
    flex: 1,
    paddingLeft: 10
  },
  commentersName: {
    fontWeight: "500"
  },
  commentDate: {
    color: "#AAAAAA",
    fontSize: 12,
    marginLeft: 5,
    marginTop: 2
  },
  commentersText: {
    color: "#AAAAAA",
    fontWeight: "100",
    fontSize: 14
  },
  plus1Wrapper: {
    position: "absolute",
    right: 0,
    top: 0
  },
  plus1Img: {
    width: 20,
    height: 20
  }
});
