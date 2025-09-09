import React from "react";
import { View } from "react-native";
import { IconButton, Badge } from "react-native-paper";

export default function NotificationBell({ count = 0, onPress }) {
  return (
    <View>
      <IconButton icon="bell-outline" onPress={onPress} size={26} />
      {count > 0 && (
        <Badge style={{ position: "absolute", top: 4, right: 4 }}>
          {count}
        </Badge>
      )}
    </View>
  );
}
