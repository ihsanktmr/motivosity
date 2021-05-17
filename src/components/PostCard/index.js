import React, { Component } from "react";
import {
  Button,
  Dimensions,
  Text,
  View,
  Image,
  TouchableHighlight,
  StyleSheet,
  ScrollView
} from "react-native";

import axios from "axios";
import api from "../../utils/api";

import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";
import CommentedBox from "../CommentedBox";
import FeedtypeIcon from "../FeedtypeIcon";
import LikeIcon from "../LikeIcon";
import CommentIcon from "../CommentIcon";
import CommentInput from "../CommentInput";
import LikedByModal from "../LikedByModal";
import Plus1Icon from "../Plus1Icon";
import Plus1Modal from "../Plus1Modal";
import ServerError from "../ServerError";

import { avatarBaseUrl } from "../../utils/images";
import { handleTokenExpiration } from "../../utils/tokenExpiration";
import CustomIcon from '../../config/icons'

export default class PostCard extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      likes: props.data.numberOfLikes,
      comments: props.data.numberOfComments,
      plus1s: props.data.numberOfPlus1,
      likeDisabled: false,
      commentInputVisible: false,
      commentText: null,
      plus1ModalVisible: false,
      plus1Text: "",
      likedBy: props.likedBy,
      commentsList: [],
      commentClicked: false,
      modalOpen: false,
      imgWidth: 0,
      imgHeight: 0,
      plus1ErrorMsg: "",
      serverError: false
    };
  }

  componentDidMount() {
    this.getComments();
    this.props.data.contentImageUrl
      ? Image.getSize(
          avatarBaseUrl + this.props.data.contentImageUrl,
          (width, height) => {
            // calculate image width and height
            const screenWidth = Dimensions.get("window").width;
            const scaleFactor = width / screenWidth;
            const imageHeight = height / scaleFactor;
            this.setState({ imgHeight: imageHeight });
          }
        )
      : null;
  }

  identifySubjectname() {
    const { data, navigation } = this.props;

    return data.subject.map((subjectName, key) => {
      if (key > 0) {
        return (
          <TouchableHighlight
            onPress={() =>
              navigation.navigate("SearchAndProfile", {
                userID: subjectName.id,
                redirectedFrom: "FEED"
              })
            }
            key={key}
            underlayColor="transparent"
          >
            <Text style={styles.userName}>, {subjectName.fullName}</Text>
          </TouchableHighlight>
        );
      } else {
        return (
          <TouchableHighlight
            onPress={() =>
              navigation.navigate("SearchAndProfile", {
                userID: subjectName.id,
                redirectedFrom: "FEED"
              })
            }
            key={key}
            underlayColor="transparent"
          >
            <Text style={styles.userName}>{subjectName.fullName}</Text>
          </TouchableHighlight>
        );
      }
    });
  }

  identifyFeedType(feedType) {
    const { data, navigation } = this.props;

    switch (feedType) {
      case "APPR":
      case "GRUP":
        return (
          <View>
            <TouchableHighlight
              onPress={() =>
                navigation.navigate("SearchAndProfile", {
                  userID: data.source.id,
                  redirectedFrom: "FEED"
                })
              }
              underlayColor="transparent"
            >
              <Text style={styles.headline}>
                Recognized for {data.title}
                <Text style={{ color: "#66C7E5", fontSize: 18 }}>
                  {" "}
                  by {data.source.fullName}
                </Text>
              </Text>
            </TouchableHighlight>
          </View>
        );
        break;
      case "BDGE":
        return (
          <View>
            <TouchableHighlight
              onPress={() =>
                navigation.navigate("SearchAndProfile", {
                  userID: data.source.id,
                  redirectedFrom: "FEED"
                })
              }
              underlayColor="transparent"
            >
              <Text style={styles.headline}>
                {data.subject[0].firstName} has received the "{data.title}"
                award
              </Text>
            </TouchableHighlight>
          </View>
        );
        break;
      default:
        return <Text style={styles.headline}>{data.title}</Text>;
        break;
    }
  }

  async handleLikeClick() {
    const { data } = this.props;

    try {
      const response = await axios.put(api.feedUrl() + "/" + data.id + "/like");
      this.setState({
        likes: this.state.likes + 1,
        likeDisabled: true,
        likedBy: response.data.response.likes
      });
    } catch (error) {
      if (error.response.status >= 500) {
        this.setState(
          {
            serverError: true
          },
          () => this.triggerChildAlert()
        );
      } else {
        const tokenError = await handleTokenExpiration();
        !tokenError
          ? await this.handleLikeClick()
          : this.setState(
              {
                serverError: true
              },
              () => this.triggerChildAlert(),
              setTimeout(() => {
                this.props.navigation.navigate("Logout");
              }, 4000)
            );
      }
    }
  }

  renderLikeIcon() {
    const { userData } = this.props;

    var currentUserLiked = false;
    if (this.state.likedBy.length === 0) {
      return (
        <LikeIcon
          disabled={false}
          onPress={() => this.handleLikeClick()}
          // imageUrl={require("../../assets/images/like-inactive.svg")}
          imageUrl={"inactive"}
          likes={this.state.likes}
          textColor={"#6F6F6F"}
        />
      );
    } else {
      for (var i = 0; i < this.state.likedBy.length; i++) {
        if (this.state.likedBy[i].userId === userData.id) {
          currentUserLiked = true;
          i = this.state.likedBy.length;
        } else {
          currentUserLiked = false;
        }
      }
    }
    if (currentUserLiked) {
      return (
        <LikeIcon
          disabled
          // imageUrl={require("../../assets/images/like-active.svg")}
          imageUrl={"active"}
          likes={this.state.likes}
          textColor={"#66C7E5"}
        />
      );
    } else {
      return (
        <LikeIcon
          disabled={this.state.likeDisabled}
          onPress={() => this.handleLikeClick()}
          imageUrl={
            this.state.likeDisabled
              ? // (require("../../assets/images/like-active.svg"))
                "active"
              : "inactive"
          }
          likes={this.state.likes}
          textColor={this.state.likeDisabled ? "#66C7E5" : "#6F6F6F"}
        />
      );
    }
  }

  async getComments() {
    const { data } = this.props;

    try {
      const response = await axios.get(api.feedUrl() + "/" + data.id);
      this.setState({
        commentsList: response.data.response.commentList
      });
    } catch (error) {
      if (error.response.status >= 500) {
        this.setState(
          {
            serverError: true
          },
          () => this.triggerChildAlert()
        );
      } else {
        const tokenError = await handleTokenExpiration();
        !tokenError
          ? await this.getComments()
          : this.setState(
              {
                serverError: true
              },
              () => this.triggerChildAlert(),
              setTimeout(() => {
                this.props.navigation.navigate("Logout");
              }, 4000)
            );
      }
      // .log(error);
    }
  }

  renderCommentIcon() {
    if (this.state.commentClicked) {
      return (
        <CommentIcon
          comments={this.state.comments}
          textColor={"#66C7E5"}
          imageUrl={"comment-active"}
          onPress={() =>
            this.setState({
              commentInputVisible: !this.state.commentInputVisible,
              commentClicked: !this.state.commentClicked
            })
          }
        />
      );
    } else {
      return (
        <CommentIcon
          comments={this.state.comments}
          textColor={"#6F6F6F"}
          imageUrl={"comment-inactive"}
          onPress={() =>
            this.setState({
              commentInputVisible: !this.state.commentInputVisible,
              commentClicked: !this.state.commentClicked
            })
          }
        />
      );
    }
  }

  async handleSubmit() {
    const { data } = this.props;

    let body = {
      commentText: this.state.commentText
    };

    try {
      const response = await axios.put(
        api.feedUrl() + "/" + data.id + "/comment",
        body
      );
      this.setState(
        {
          comments: this.state.comments + 1,
          commentClicked: false,
          commentInputVisible: false
        },
        () => this.getComments()
      );
    } catch (error) {
      if (error.response.status >= 500) {
        this.setState(
          {
            serverError: true
          },
          () => this.triggerChildAlert()
        );
      } else {
        const tokenError = await handleTokenExpiration();
        !tokenError
          ? await this.handleSubmit()
          : this.setState(
              {
                serverError: true
              },
              () => this.triggerChildAlert(),
              setTimeout(() => {
                this.props.navigation.navigate("Logout");
              }, 4000)
            );
      }
    }
  }

  renderPlus1() {
    const { data, userData } = this.props;
    return data.feedType === "APPR" && data.subject[0].id !== userData.id ? (
      <Plus1Icon
        plus1s={this.state.plus1s}
        textColor={"#6F6F6F"}
        imageUrl={"add-buck-inactive"}
        onPress={() =>
          this.setState({
            plus1ModalVisible: !this.state.plus1ModalVisible
          })
        }
      />
    ) : null;
  }

  async handlePlus1Submit(commentText) {
    const { data } = this.props;

    let body = {
      commentText
    };

    try {
      const response = await axios.put(
        api.plus1Url() + data.id + "/plus1",
        body
      );

      this.setState(
        {
          comments: this.state.comments + 1,
          plus1s: this.state.plus1s + 1,
          plus1ModalVisible: !this.state.plus1ModalVisible
        },
        () => this.getComments()
      );
    } catch (error) {
      if (error.response.status === 401) {
        const tokenError = await handleTokenExpiration();
        !tokenError
          ? await this.handlePlus1Submit(this.state.plus1Text)
          : this.setState(
              {
                serverError: true
              },
              () => this.triggerChildAlert(),
              setTimeout(() => {
                this.props.navigation.navigate("Logout");
              }, 4000)
            );
      } else if (error.response.status >= 500) {
        this.setState(
          {
            serverError: true,
            animating: false,
            buttonDisabled: false
          },
          () => this.triggerChildAlert()
        );
      } else {
        this.setState({
          plus1ErrorMsg: error.response.data.mvMessages[0].message,
          animating: false,
          buttonDisabled: false
        });
      }
    }
  }

  renderLikedBy() {
    const { userData } = this.props;

    switch (this.state.likedBy.length) {
      case 0:
        return this.state.likeDisabled ? (
          <View style={styles.likedByTextWrapper}>
            <Text style={styles.likedByText}>Liked by {userData.fullName}</Text>
          </View>
        ) : null;
        break;
      case 1:
        return (
          <View style={styles.likedByTextWrapper}>
            <Text style={styles.likedByText}>
              Liked by{" "}
              {this.state.likedBy.map((data, key) => (
                <Text key={key}>{data.fullName} </Text>
              ))}
            </Text>
          </View>
        );
        break;
      case 2:
        return (
          <View style={styles.likedByTextWrapper}>
            <Text style={styles.likedByText}>
              Liked by{" "}
              {this.state.likedBy.map((data, key) => (
                <Text key={key}>
                  {data.fullName}
                  {key === 0 ? "," : null}{" "}
                </Text>
              ))}
            </Text>
          </View>
        );
        break;
      default:
        return (
          <TouchableHighlight
            underlayColor="transparent"
            style={{ flex: 1, flexDirection: "row" }}
            onPress={() => this.setState({ modalOpen: !this.state.modalOpen })}
          >
            <View style={styles.likedByTextWrapper}>
              <Text style={styles.likedByText}>Liked by </Text>
              <Text style={styles.likedByText}>
                {this.state.likedBy.map((data, key) => {
                  if (key < 2) {
                    return (
                      <Text key={key}>
                        {data.fullName}
                        {key === 0 ? "," : null}{" "}
                      </Text>
                    );
                  } else if (key >= 3) {
                    return null;
                  } else if (this.state.likedBy.length === 3) {
                    return (
                      <Text key={key}>
                        and {this.state.likedBy.length - 2} other
                      </Text>
                    );
                  } else {
                    return (
                      <Text key={key}>
                        and {this.state.likedBy.length - 2} others
                      </Text>
                    );
                  }
                })}
              </Text>
            </View>
          </TouchableHighlight>
        );
    }
  }

  triggerChildAlert() {
    this.refs.child.serverErrorAlert();
  }

  render() {
    const { imgWidth, imgHeight } = this.state;
    const { data, userData, currencyNickname } = this.props;

    return (
      <View style={styles.post}>
        <View style={styles.mainSection}>
          <View style={styles.upperPart}>
            <View style={styles.imgContainer}>
              <Image
                style={styles.img}
                source={{ uri: avatarBaseUrl + data.iconUrl }}
              />
            </View>
            <View style={styles.name}>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {this.identifySubjectname()}
              </View>
              <Text style={styles.postDate}>{data.readableDate}</Text>
            </View>
            <View style={styles.badge}>
              {data.feedType === "BDGE" ? (
                <View style={styles.iconWrapper}>
                  {/* <Image
                    style={styles.icon}
                    source={{ uri: avatarBaseUrl + data.imageUrl }}
                  /> */}
                  <CustomIcon name={'star'} size={18} color={'#fff'}/>
                </View>
              ) : (
                <FeedtypeIcon feedType={data.feedType} />
              )}
            </View>
          </View>
          <View style={styles.middlePart}>
            <View>
              {this.identifyFeedType(data.feedType)}
              {data.contentImageUrl ? (
                <View>
                  <Image
                    source={{ uri: avatarBaseUrl + data.contentImageUrl }}
                    style={{ width: "100%", height: imgHeight }}
                    resizeMode={"contain"}
                  />
                </View>
              ) : null}
              {!(data.feedType === "INST") ? (
                <Text style={styles.note}>{data.note}</Text>
              ) : null}
            </View>
          </View>
        </View>
        <View style={styles.lowerPart}>
          {userData ? this.renderLikeIcon() : null}
          {this.renderCommentIcon()}
          {this.renderPlus1()}
        </View>
        {this.state.likedBy.length ? (
          <View style={styles.likesPart}>{this.renderLikedBy()}</View>
        ) : null}
        <View>
          {this.state.commentInputVisible ? (
            <CommentInput
              onSubmitEditing={() => this.handleSubmit()}
              onChangeText={val => this.setState({ commentText: val })}
              onPress={() => this.handleSubmit()}
            />
          ) : null}
          <View style={styles.commentsWrapper}>
            {this.state.commentsList
              ? this.state.commentsList.map((data, key) => (
                  <CommentedBox data={data} key={key} />
                ))
              : null}
          </View>
        </View>
        <LikedByModal
          visible={this.state.modalOpen}
          likedByUsers={this.state.likedBy}
          onRequestClose={() =>
            this.setState({ modalOpen: !this.state.modalOpen })
          }
        />
        <Plus1Modal
          currencyNickname={currencyNickname}
          visible={this.state.plus1ModalVisible}
          onRequestClose={() =>
            this.setState({ plus1ModalVisible: !this.state.plus1ModalVisible })
          }
          handlePlus1Submit={commentText =>
            this.setState({ plus1Text: commentText }, () =>
              this.handlePlus1Submit(this.state.plus1Text)
            )
          }
          plus1ErrorMsg={this.state.plus1ErrorMsg}
        />
        {this.state.serverError ? <ServerError ref="child" /> : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  post: {
    backgroundColor: "#FFFFFF",
    borderRadius: 3,
    borderColor: "#DDDDDD",
    borderBottomWidth: 2,
    marginVertical: 3,
    zIndex: 100
  },
  mainSection: {
    paddingHorizontal: 20,
    paddingVertical: 15
  },
  upperPart: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  imgContainer: {
    flex: 0,
    padding: 5
  },
  img: {
    height: 50,
    width: 50,
    borderRadius: 3
  },
  name: {
    flex: 1,
    marginLeft: 10
  },
  userName: {
    color: "#323232",
    fontSize: 16
  },
  postDate: {
    color: "#AAAAAA",
    fontSize: 13
  },
  badge: {
    flex: 0
  },
  iconWrapper: {
    padding: 4,
    borderRadius: 2
  },
  icon: {
    width: 25,
    height: 25
  },
  middlePart: {
    marginVertical: 10
  },
  headline: {
    color: "#323232",
    fontSize: 18,
    marginBottom: 10
  },
  note: {
    color: "#AAAAAA",
    fontSize: 14
  },
  lowerPart: {
    borderColor: "#EDEDED",
    borderTopWidth: 1,
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 15,
    zIndex: 10000
  },
  likesPart: {
    flex: 1,
    borderColor: "#EDEDED",
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingVertical: 15
  },
  likedByTextWrapper: {
    alignSelf: "center",
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-start",
    marginLeft: 20
  },
  likedByText: {
    color: "#66C7E5",
    fontWeight: "300",
    fontSize: 11
  },
  likedBy: {
    color: "#66C7E5"
  },
  commentsWrapper: {
    borderTopColor: "#EDEDED",
    borderLeftWidth: 0,
    borderTopWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    paddingRight: 20
  },
  commentsList: {
    flex: 1,
    height: 100
  },
  mvBlue: {
    color: "#66C7E5"
  }
});
