import React from "react";
import { Animated, Easing } from "react-native";
import {
  DrawerNavigator,
  TabNavigator,
  StackNavigator
} from "react-navigation";

import Splash from "../routes/Splash";
import Login from "../routes/Login";
import Home from "../routes/Home";
import Recent from "../routes/Recent";
import Thanks from "../routes/Thanks";
import Highlight from "../routes/Highlight";
import Store from "../routes/Store";
import Awards from "../routes/Awards";
import Profile from "../routes/Profile";
import More from "../routes/More";
import LogOut from "../routes/LogOut";
import SearchAndProfile from "../routes/SearchAndProfile";
import Domain from '../routes/Domain'
import IDPwebView from '../routes/IDPwebView'
import RecentIcon from 'react-native-vector-icons/FontAwesome5'
import CardStackStyleInterpolator from 'react-navigation/src/views/CardStack/CardStackStyleInterpolator';


import CustomIcon from "./icons";

const HomeStack = StackNavigator(
  {
    Home: { screen: Home },
    Thanks: { screen: Thanks },
    Highlight: { screen: Highlight }
  },
  {
    initialRouteName: "Home",
    headerMode: "none",
    navigationOptions: {
      gesturesEnabled: true,
      gesturesDirection: 'inverted',
    },
    transitionConfig: () => ({
      screenInterpolator: CardStackStyleInterpolator.forHorizontal,
    }),
  })



const Tabs = TabNavigator(
  {
    Home: {
      screen: HomeStack,
      navigationOptions: {
        tabBarLabel: "Home",
        tabBarIcon: (
          <CustomIcon
            name={"nav-home"}
            size={22}
            style={{ height: 22, width: 22 }}
            color={"#333"}
          />
        ),
        header: null
      }
    },
    Recent: {
      screen: Recent,
      navigationOptions: {
        tabBarLabel: "Recent",
        tabBarIcon: (
          <RecentIcon
            name={"list"}
            size={21}
            style={{ height: 22, width: 22 }}
            color={"#333"}
          />
        ),
        header: null
      }
    },
    Store: {
      screen: Store,
      navigationOptions: {
        tabBarLabel: "Store",
        tabBarIcon: (
          <CustomIcon
            name={"nav-store"}
            size={21}
            style={{ height: 22, width: 22 }}
            color={"#333"}
          />
        ),
        header: null
      }
    },
    Awards: {
      screen: Awards,
      navigationOptions: {
        tabBarLabel: "Awards",
        tabBarIcon: (
          <CustomIcon
            name={"nav-awards"}
            size={20}
            style={{ height: 20, width: 20, marginTop: 4 }}
            color={"#333"}
          />
        ),
        header: null
      }
    },
    More: {
      screen: More,
      navigationOptions: {
        tabBarLabel: "More",
        tabBarIcon: (
          <CustomIcon
            name={"nav-more"}
            size={22}
            style={{ height: 22, width: 22 }}
            color={"#333"}
          />
        ),
        header: null
      }
    }
  },
  {
    initialRouteName: "Home",
    tabBarPosition: "bottom",
    swipeEnabled: false,
    animationEnabled: false,
    tabBarOptions: {
      hiddenTabs: [4, 5, 6],
      upperCaseLabel: false,
      showIcon: true,
      activeTintColor: "#61c7e7",
      inactiveTintColor: "#7E7E7E",
      pressColor: "#61c7e7",
      indicatorStyle: {
        backgroundColor: "transparent"
      },
      labelStyle: {
        fontSize: 11
      },
      tabStyle: {
        height: 50,
        paddingVertical: 0,
        paddingHorizontal: 0
      },
      iconStyle: {
        flexGrow: 0,
        marginTop: 0
      },
      style: {
        backgroundColor: "#FFFFFF"
      }
    },

    navigationOptions: ({ navigation }) => ({
      tabBarOnPress: nav => {
        if (nav.scene.route.routeName === "More") {
          navigation.navigate("DrawerToggle");
        } else {
          nav.jumpToIndex(nav.scene.index);
        }
      }
    })
  }
);

const Drawer = DrawerNavigator(
  {
    Tabs: {
      screen: Tabs,
      navigationOptions: {
        drawerLabel: () => null
      }
    },
    Profile: {
      screen: Profile,
      navigationOptions: {
        gesturesEnabled: false,
        drawerLabel: "My Profile"
      }
    },
    Search: { screen: SearchAndProfile },
    Logout: { screen: LogOut },
    SearchAndProfile: {
      screen: SearchAndProfile,
      navigationOptions: {
        drawerLabel: () => null
      }
    }
  },
  {
    drawerPosition: "right",
    initialRouteName: "Tabs",
    drawerOpenRoute: "DrawerOpen",
    drawerCloseRoute: "DrawerClose",
    drawerToggleRoute: "DrawerToggle"
  }
);


const NotLoggedIn = StackNavigator(
  {
    LoginScreen: {
      screen: Login,
      navigationOptions: {
        gesturesEnabled: false
      }
    },
    DamainScreen: {
      screen: Domain,
      navigationOptions: {
        gesturesEnabled: false,
      }
    },
    IDPwebView: {
      screen: IDPwebView,
      navigationOptions: {
        gesturesEnabled: false,
      }
    },
    Drawer: { screen: Drawer }
  },
  {
    initialRouteName: "LoginScreen",
    headerMode: "none",
    navigationOptions: {
      gesturesEnabled: false
    }
  }
);

const LoggedIn = StackNavigator(
  {
    Drawer: { screen: Drawer }
  },
  {
    headerMode: "none",
    navigationOptions: {
      gesturesEnabled: false
    },
    transitionConfig: () => ({
      transitionSpec: {
        duration: 0,
        timing: Animated.timing,
        easing: Easing.step0
      }
    })
  }
);

export const Root = StackNavigator(
  {
    Splash: { screen: Splash },
    LoggedIn: {
      screen: LoggedIn,
      navigationOptions: {
        gesturesEnabled: false
      }
    },
    NotLoggedIn: { screen: NotLoggedIn }
  },
  {
    headerMode: "none",
    navigationOptions: {
      gesturesEnabled: false
    },
    transitionConfig: () => ({
      transitionSpec: {
        duration: 0,
        timing: Animated.timing,
        easing: Easing.step0
      }
    })
  }
);
