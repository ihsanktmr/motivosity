import {
    apiAuthUrl,
    apiBaseUrl,
} from "./constants"

export default {
    companyInterfaceUrl: () => `${apiBaseUrl}/company/interface`,

    userSignInUrl: () => `${apiAuthUrl}/signin`,
    userRefreshTokenUrl: () => `${apiAuthUrl}/refresh`,
    userRefreshTokenUrlWithSurvey: () => `${apiAuthUrl}/refresh?checkSurvey=true`,
    userResetPassword: () => `${apiAuthUrl}/password`,
    submitSurvey: () => `${apiBaseUrl}/satisfactionsurvey`,

    //Home page
    currentUserUrl: () => `${apiBaseUrl}/user/me`,
    feedUrl: () => `${apiBaseUrl}/feed`,
    plus1Url: () => `${apiBaseUrl}/comment/`,

    //Thanks page
    usersList: () => `${apiBaseUrl}/user/search`,
    givingAppreciation: () => `${apiBaseUrl}/appreciation`,
    givingAppreciationSetup: () => `${apiBaseUrl}/appreciation/setup`,
    companyValues: () => `${apiBaseUrl}/companyvalue`,
    userCash: () => `${apiBaseUrl}/usercash`,
    getLastThanks: () => `${apiBaseUrl}/feed/lastthanked`,
    getLastThanks1: () => `${apiBaseUrl}/feed/lastthanked?page=1`,

    //Sent highlishts
    givingHighlight : ()=> `${apiBaseUrl}/feed/highlight`,

    //Store page
    storeItems: () => `${apiBaseUrl}/store`,
    purchaseStoreItems: () => `${apiBaseUrl}/store/purchase`,

    //Award page
    myAwardsListUrl: () => `${apiBaseUrl}/award/myawards`,
    giveAward: () => `${apiBaseUrl}/award`,

    //Profile
    currentUserProfile: () => `${apiBaseUrl}/user/profile`,
    selectedUserProfile: () => `${apiBaseUrl}/user/`,
    companyInterestsUrl: () => `${apiBaseUrl}/interest`,
    currentUserInterests: () => `${apiBaseUrl}/interest/`,
    companyResponsibilitiesUrl: () => `${apiBaseUrl}/responsibility`,
    currentUserResponsibilities: () => `${apiBaseUrl}/responsibility/`,
    uploadBackgroundImageUrl: () => `${apiBaseUrl}/user/background`,
    uploadingProfileImg: () => `${apiBaseUrl}/user/avatar`,

    //Search page
    fullSearch: () => `${apiBaseUrl}/user/fullsearch`,
}
