import React, { useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AIMessage from "../components/AIMessage";
import ChatHeader from "../components/ChatHeader";
import ChatInput from "../components/ChatInput";
import ScrollToBottomButton from "../components/ScrollToBottomButton";
import UserMessage from "../components/UserMessage";
import { useAppSelector } from "../store/hooks";

const chatMockData = [
  {
    id: 1,
    message:
      "Hey, I’ve been struggling a bit with staying productive while working from home lately. There are just so many distractions around, and I feel like my focus is all over the place. Do you have any advice that could help?",
    sender: "user",
  },
  {
    id: 2,
    message:
      "Absolutely, you're definitely not alone in that. One approach that works really well is setting up a dedicated space at home that’s strictly for work. Even if it’s just a small desk in a quiet corner, having a space that your brain associates with 'focus time' can make a big difference. Also, try defining a clear start and end to your workday so it doesn’t blur into your personal time.",
    sender: "assistant",
  },
  {
    id: 3,
    message:
      "That makes sense. I’ve kind of tried that before, but even when I have my own workspace, I still get distracted a lot—especially by my phone. I keep picking it up without even realizing it, and before I know it, I’ve lost 20 minutes scrolling through random stuff.",
    sender: "user",
  },
  {
    id: 4,
    message:
      "Yeah, that’s a super common issue. Phones are designed to grab our attention, so don’t feel bad—it happens to the best of us. One trick is to physically remove it from your environment during focus sessions, like placing it in another room or even putting it on airplane mode. There are also apps that block certain apps or websites during work hours. It’s all about reducing the temptation so your brain doesn’t have to fight it every few minutes.",
    sender: "assistant",
  },
  {
    id: 5,
    message:
      "I think I’ll try leaving it in another room tomorrow and see how that goes. Another problem I have is with my family. Since I’m home, they often assume I’m free to chat or help with things during the day, even when I’m in the middle of work. It’s hard to say no without sounding rude.",
    sender: "user",
  },
  {
    id: 6,
    message:
      "That’s a really tricky situation, and you’re not alone there either. Setting boundaries is tough, especially with people you care about. One way to approach it is by having a gentle but honest conversation. Let them know your work hours and why uninterrupted time is important. You could even use a visual signal—like wearing headphones or putting a sign up—so they know when you’re in the zone. Most people are surprisingly understanding once they realize what you’re trying to do.",
    sender: "assistant",
  },
  {
    id: 7,
    message:
      "Yeah, I guess I’ve been trying to avoid confrontation, but you’re right—it’s probably better to just be upfront and explain why I need that space. I’ll try setting clearer expectations this week and see if that helps. Thanks a lot for your advice, seriously.",
    sender: "user",
  },
  {
    id: 8,
    message:
      "You’re very welcome! It sounds like you’re already doing your best, and that’s something to be proud of. Working from home is a huge adjustment, and it takes time to build habits that work for you. Feel free to reach out anytime you want to chat more about routines, time management, or anything else that’s on your mind.",
    sender: "assistant",
  },
];

const ChatScreen = () => {
  const { theme } = useAppSelector((state) => state.theme);
  const isDark = theme === "dark";
  const [text, setText] = useState("");
  const [messages, setMessages] = useState(chatMockData);
  const flatListRef = useRef<FlatList>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  const handleSend = () => {
    if (text.trim()) {
      const newMessage = {
        id: messages.length + 1,
        message: text.trim(),
        sender: "user",
      };
      setMessages([...messages, newMessage]);
      setText("");

      // Scroll to bottom after a short delay to ensure the new message is rendered
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  // This function runs when the user scrolls in a ScrollView or FlatList
  const handleScroll = (event: any) => {
    // Destructure the scroll position and sizes from the scroll event
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;

    // Check if the user is NOT near the bottom of the scroll view
    // Specifically, if the scroll position (contentOffset.y)
    // is at least 450 pixels above the bottom
    const isScrolledUp =
      contentOffset.y < contentSize.height - layoutMeasurement.height - 450;

    // Show the "scroll to bottom" button only when the user is scrolled up
    setShowScrollToBottom(isScrolledUp);
  };

  const scrollToBottom = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-gray-900" : "bg-white"}`}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1">
          {/* Chat Header */}
          <ChatHeader
            onMenuPress={() => {
              console.log("Menu pressed");
            }}
            onTitlePress={() => {
              console.log("Title pressed");
            }}
            onNewChatPress={() => {
              console.log("New chat pressed");
            }}
          />

          {/* Chat Messages */}
          <FlatList
            ref={flatListRef}
            className="flex-1 pt-6"
            data={messages}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            renderItem={({ item }) =>
              item.sender === "user" ? (
                <UserMessage message={item.message} />
              ) : (
                <AIMessage message={item.message} />
              )
            }
          />

          {/* Sticky Scroll to Bottom Button */}
          <ScrollToBottomButton
            visible={showScrollToBottom}
            onPress={scrollToBottom}
          />

          {/* Bottom Input */}
          <ChatInput
            text={text}
            onTextChange={setText}
            onSend={handleSend}
            onAddPress={() => {
              console.log("add pressed");
            }}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;
