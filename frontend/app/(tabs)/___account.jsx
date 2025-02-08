// import React, { useEffect } from "react";
// import { View, Text, TouchableOpacity } from "react-native";
// import ReactNativeHapticFeedback from "react-native-haptic-feedback";

// const options = {
//   enableVibrateFallback: true,
//   ignoreAndroidSystemSettings: false,
// };

// const Account = () => {
//   useEffect(() => {
//     ReactNativeHapticFeedback.trigger("impactLight", options);
//   }, []);

//   return (
//     <View className="flex-1 justify-center items-center bg-white">
//       <Text className="text-2xl font-bold">hellowrodl</Text>
//       <Text className="text-lg mt-4">Your adventure starts here!</Text>

//       <TouchableOpacity
//         className="mt-6 px-4 py-2 bg-blue-500 rounded-lg"
//         onPress={() =>
//           ReactNativeHapticFeedback.trigger("notificationSuccess", options)
//         }
//       >
//         <Text className="text-white font-semibold">Press Me</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// export default Account;
