import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ArrowUpCircleSvgrepoCom from "../assets/svg/arrow-up-circle-svgrepo-com.svg";
import Close from "../assets/svg/close.svg";
import ColorModeSvgrepoCom from "../assets/svg/color-mode-svgrepo-com.svg";
import ConnectorIcon from "../assets/svg/connector-icon.svg";
import DataControlsIcon from "../assets/svg/data-controls-icon.svg";
import EmailSvgrepoCom from "../assets/svg/email-svgrepo-com.svg";
import FavouriteSvgrepoCom from "../assets/svg/favourite-svgrepo-com.svg";
import GlobalSvgrepoCom from "../assets/svg/global-svgrepo-com.svg";
import Library from "../assets/svg/library.svg";
import LogoutLineSvgrepoCom from "../assets/svg/logout-line-svgrepo-com.svg";
import NotificationsOutlineSvgrepoCom from "../assets/svg/notifications-outline-svgrepo-com.svg";
import ParentalControlsIcon from "../assets/svg/parental-controls-icon.svg";
import PhoneSvgrepoCom from "../assets/svg/phone-svgrepo-com.svg";
import PlusSquareSvgrepoCom from "../assets/svg/plus-square-svgrepo-com.svg";
import RedoSvgrepoCom from "../assets/svg/redo-svgrepo-com.svg";
import SecuritySecuredProfileSvgrepoCom from "../assets/svg/security-secured-profile-svgrepo-com.svg";
import SunSvgrepoCom from "../assets/svg/sun-svgrepo-com.svg";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { logout } from "../store/slices/authSlice";

interface SettingsSheetProps {
  onClose?: () => void;
  onLogout?: () => void;
}

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <Text className="text-sm text-gray-500 px-8 pt-3 pb-2">{title}</Text>
);

const Row: React.FC<{
  left: React.ReactNode;
  title: string;
  right?: React.ReactNode;
  onPress?: () => void;
}> = ({ left, title, right, onPress }) => (
  <TouchableOpacity
    activeOpacity={0.7}
    onPress={onPress}
    className="flex-row items-center justify-between px-4 py-3 bg-white"
    style={{ borderBottomWidth: 0.5, borderBottomColor: "#EFEFEF" }}
  >
    <View className="flex-row items-center">
      <View className="mr-3">{left}</View>
      <Text className="text-lg text-gray-900">{title}</Text>
    </View>
    {right}
  </TouchableOpacity>
);

export type SettingsSheetRef = BottomSheet;

const SettingsSheet = forwardRef<SettingsSheetRef, SettingsSheetProps>(
  (props, forwardedRef) => {
    const snapPoints = useMemo(() => ["100%"], []);
    const insets = useSafeAreaInsets();
    const dispatch = useAppDispatch();
    const userEmail = useAppSelector((state) => state.auth.user?.email);
    const internalRef = useRef<BottomSheet>(null);
    const scrollViewRef = useRef<any>(null);
    const [isOpen, setIsOpen] = useState(false);
    const scrollY = useSharedValue(0);

    useImperativeHandle(forwardedRef, () => internalRef.current as any, []);

    const closeSheet = () => {
      // Reset state when closing
      scrollY.value = 0;
      scrollViewRef.current?.scrollTo?.({ y: 0, animated: false });
      // Prefer parent handler if provided
      props.onClose?.();
      internalRef.current?.close?.();
    };

    const handleLogout = () => {
      // Dispatch logout action to clear auth state and navigate to login
      dispatch(logout());
      // Call parent logout handler if provided
      props.onLogout?.();
      // Close the settings sheet
      closeSheet();
    };

    const handleLogoutPress = () => {
      const emailLabel = userEmail ?? "your account";
      Alert.alert(
        "Log out",
        `Log out of MeabuAI as "${emailLabel}"?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Yes", style: "destructive", onPress: handleLogout },
        ],
        { cancelable: true }
      );
    };

    const handleSheetChange = (index: number) => {
      setIsOpen(index >= 0);

      // Reset state when sheet closes (index becomes -1)
      if (index === -1) {
        // Reset scroll position to top
        setTimeout(() => {
          scrollViewRef.current?.scrollTo?.({ y: 0, animated: false });
        }, 100);
      }
    };

    // Reset when sheet opens
    useEffect(() => {
      if (isOpen) {
        scrollY.value = 0;
        setTimeout(() => {
          scrollViewRef.current?.scrollTo?.({ y: 0, animated: false });
        }, 100);
      }
    }, [isOpen]);

    // Animated style for header background based on scroll position
    const headerAnimatedStyle = useAnimatedStyle(() => {
      const opacity = Math.min(scrollY.value / 50, 1); // 0 to 1 based on scroll
      const backgroundColor = `rgba(254, 254, 254, ${opacity})`;

      return {
        backgroundColor,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
      };
    });

    return (
      <BottomSheet
        ref={internalRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        handleComponent={() => null}
        topInset={insets.top}
        enableContentPanningGesture={true}
        enableOverDrag={false}
        onChange={handleSheetChange}
        backdropComponent={(backdropProps) => (
          <BottomSheetBackdrop
            {...backdropProps}
            disappearsOnIndex={-1}
            appearsOnIndex={0}
          />
        )}
        backgroundStyle={{ backgroundColor: "#F3F2F7", borderRadius: 16 }}
      >
        {/* Fixed header area */}
        <Animated.View
          className="py-4 px-4 flex-row items-center justify-center"
          style={headerAnimatedStyle}
        >
          <Text className="text-xl font-semibold text-gray-900">Settings</Text>
          <TouchableOpacity
            onPress={closeSheet}
            style={{
              position: "absolute",
              right: 16,
              width: 22,
              height: 22,
              borderRadius: 11,
              backgroundColor: "#D6D5DA",
              alignItems: "center",
              justifyContent: "center",
            }}
            activeOpacity={0.7}
          >
            <Close width={10} height={10} fill="#ACACAC" />
          </TouchableOpacity>
        </Animated.View>

        <BottomSheetScrollView
          ref={scrollViewRef}
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          showsVerticalScrollIndicator={true}
          onScroll={(event: NativeSyntheticEvent<NativeScrollEvent>) => {
            const scrollYValue = event.nativeEvent.contentOffset.y;
            scrollY.value = scrollYValue;
          }}
        >
          <SectionHeader title="ACCOUNT" />
          <View
            className="rounded-2xl overflow-hidden mx-3"
            style={{ borderWidth: 1, borderColor: "#EFEFEF" }}
          >
            <Row
              left={<EmailSvgrepoCom width={20} height={20} />}
              title="Email"
              right={
                <Text className="text-gray-500 text-base">
                  example@email.com
                </Text>
              }
            />
            <Row
              left={<PhoneSvgrepoCom width={20} height={20} />}
              title="Phone number"
              right={
                <Text className="text-gray-500 text-base">+123456789</Text>
              }
            />
            <Row
              left={<PlusSquareSvgrepoCom width={20} height={20} />}
              title="Subscription"
              right={<Text className="text-gray-500 text-base">Free Plan</Text>}
            />
            <Row
              left={<ArrowUpCircleSvgrepoCom width={20} height={20} />}
              title="Upgrade to ChatGPT Plus"
            />
            <Row
              left={<RedoSvgrepoCom width={20} height={20} />}
              title="Restore purchases"
            />
            <Row
              left={<FavouriteSvgrepoCom width={20} height={20} />}
              title="Personalization"
              right={<Text>›</Text>}
            />
            <Row
              left={<NotificationsOutlineSvgrepoCom width={20} height={20} />}
              title="Notifications"
              right={<Text>›</Text>}
            />
            <Row
              left={<ConnectorIcon width={20} height={20} />}
              title="Apps & connectors"
              right={<Text>›</Text>}
            />
            <Row
              left={<ParentalControlsIcon width={20} height={20} />}
              title="Parental controls"
              right={<Text>›</Text>}
            />
            <Row
              left={<DataControlsIcon width={20} height={20} />}
              title="Data controls"
              right={<Text>›</Text>}
            />
            <Row
              left={<Library width={20} height={20} />}
              title="Archived chats"
              right={<Text>›</Text>}
            />
            <Row
              left={<SecuritySecuredProfileSvgrepoCom width={20} height={20} />}
              title="Security"
              right={<Text>›</Text>}
            />
          </View>

          <SectionHeader title="APP" />
          <View
            className="rounded-2xl overflow-hidden mx-3"
            style={{ borderWidth: 1, borderColor: "#EFEFEF" }}
          >
            <Row
              left={<GlobalSvgrepoCom width={20} height={20} />}
              title="App language"
              right={<Text className="text-gray-500 text-base">English ›</Text>}
            />
            <Row
              left={<SunSvgrepoCom width={20} height={20} />}
              title="Appearance"
              right={<Text className="text-gray-500 text-base">System ›</Text>}
            />
            <Row
              left={<ColorModeSvgrepoCom width={20} height={20} />}
              title="Accent color"
              right={<Text className="text-gray-500 text-base">Default</Text>}
            />
          </View>
          <View style={{ height: 16 }} />

          {/* Logout bar */}
          <View className="mx-3">
            <TouchableOpacity
              onPress={handleLogoutPress}
              activeOpacity={0.7}
              className="bg-white rounded-2xl px-4 py-4 flex-row items-center"
              style={{ borderWidth: 1, borderColor: "#EFEFEF" }}
            >
              <LogoutLineSvgrepoCom
                width={18}
                height={18}
                style={{ marginRight: 8 }}
              />
              <Text className="text-lg text-gray-900">Log out</Text>
            </TouchableOpacity>
          </View>
        </BottomSheetScrollView>
      </BottomSheet>
    );
  }
);

SettingsSheet.displayName = "SettingsSheet";

export default SettingsSheet;
