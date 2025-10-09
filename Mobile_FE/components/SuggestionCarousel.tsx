import React from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

export type SuggestionCard = {
  id: string;
  title: string;
  subtitle?: string;
  prompt: string;
};

// Default suggestions used for a fresh conversation
export const SUGGESTION_CARDS: SuggestionCard[] = [
  {
    id: "cartoon_pet",
    title: "Create a cartoon",
    subtitle: "illustration of my pet",
    prompt: "Create a cute cartoon-style illustration of my pet from a photo.",
  },
  {
    id: "quiz_capitals",
    title: "Quiz me on world capitals",
    subtitle: "to enhance my geography skills",
    prompt: "Quiz me on world capitals with 10 progressively harder questions.",
  },
  {
    id: "itinerary",
    title: "Plan a weekend trip",
    subtitle: "within a $500 budget",
    prompt: "Plan a 2-day trip under $500 including food and activities.",
  },
  {
    id: "summarize_pdf",
    title: "Summarize a PDF",
    subtitle: "into key insights",
    prompt: "Summarize this PDF into key insights and action items.",
  },
];

type SuggestionCarouselProps = {
  data?: SuggestionCard[];
  onSelect?: (card: SuggestionCard) => void;
  testID?: string;
};

const Card: React.FC<{ item: SuggestionCard; onPress?: () => void }> = ({
  item,
  onPress,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className="mr-3"
      style={{ width: 250 }}
    >
      <View
        className="rounded-2xl"
        style={{
          paddingVertical: 12,
          paddingHorizontal: 14,
          borderWidth: 1,
          borderColor: "#E5E7EB",
          backgroundColor: "#F3F4F6",
        }}
      >
        <Text className="text-black text-lg font-semibold" numberOfLines={1}>
          {item.title}
        </Text>
        {!!item.subtitle && (
          <Text className="text-gray-500 mt-1" numberOfLines={2}>
            {item.subtitle}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const SuggestionCarousel: React.FC<SuggestionCarouselProps> = ({
  data = SUGGESTION_CARDS,
  onSelect,
  testID,
}) => {
  return (
    <View testID={testID} className="px-4">
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card item={item} onPress={() => onSelect?.(item)} />
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 16 }}
      />
    </View>
  );
};

export default SuggestionCarousel;
