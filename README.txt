Getting Started:
run npm install in mv-mobile
run yarn in mv-mobile
run react-native run-ios to open in a simulator
run react-native run-android for android sim


Deploy IOS:
Open Motivosity.xcworkspace to build in XCode
Update version
Choose generic simulator
Choose Build->Archive


Deploy Android
Install Android.
~/Library/Android/sdk/tools/bin/sdkmanager --licenses (accept the license agreement)
~/Library/Android/sdk/tools/bin/sdkmanager --update


Open the android folder as a project from the repo

File -> Sync Gradle
File -> Invalidate Caches and Restart

