import React, { useState } from "react";
import { 
  View, Text, TouchableOpacity, ScrollView, SafeAreaView, TextInput, Modal 
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function CommunityPage() {
  const { discussion } = useLocalSearchParams();
  
  // Ensure discussion object is parsed correctly
  const parsedDiscussion = discussion ? JSON.parse(discussion) : null;

  if (!parsedDiscussion) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-lg font-semibold text-gray-800">No Discussion Found</Text>
      </SafeAreaView>
    );
  }

  const { title, description, createdBy, votes, comments, bgColor, iconColor } = parsedDiscussion;

  // Hardcoded comments & replies for each discussion topic
  const commentBank = {
    "Fixing Potholes in Downtown": [
      { id: 1, author: "John Doe", text: "How can we report potholes?", likes: 5, liked: false, replies: [{ id: 1, author: "Sarah Lee", text: "@John Doe Try the city’s website.", likes: 2, liked: false }] },
      { id: 2, author: "Sarah Lee", text: "Should we start a petition?", likes: 3, liked: false, replies: [] }
    ],
    "Community Cleanup Initiative": [
      { id: 1, author: "Liam Johnson", text: "How to organize a cleanup event?", likes: 6, liked: false, replies: [{ id: 1, author: "Olivia Carter", text: "@Liam Johnson We can make a signup form!", likes: 4, liked: false }] },
      { id: 2, author: "Sophia Adams", text: "Can local businesses sponsor cleanup drives?", likes: 8, liked: false, replies: [] }
    ],
    "Streetlight Safety Concerns": [
      { id: 1, author: "Ethan Wright", text: "Why are so many streetlights broken?", likes: 4, liked: false, replies: [{ id: 1, author: "Daniel Smith", text: "@Ethan Wright Budget cuts could be a reason.", likes: 2, liked: false }] },
      { id: 2, author: "Nina Patel", text: "How often are streetlights inspected?", likes: 5, liked: false, replies: [] }
    ],
    "Public Transport Delays Discussion": [
      { id: 1, author: "James Miller", text: "Why are buses always late?", likes: 9, liked: false, replies: [{ id: 1, author: "Emma Davis", text: "@James Miller Traffic is a big issue.", likes: 3, liked: false }] },
      { id: 2, author: "Lucas Green", text: "Should the city increase metro frequency?", likes: 7, liked: false, replies: [] }
    ],
  };

  // Get relevant comments based on discussion topic
  const [commentsList, setCommentsList] = useState(commentBank[title] || []);
  const [modalVisible, setModalVisible] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [newComment, setNewComment] = useState("");

  // Add a new comment or reply
  const addComment = () => {
    if (newComment.trim() === "") return;
    
    if (replyTo) {
      setCommentsList((prev) =>
        prev.map((comment) =>
          comment.id === replyTo.id
            ? {
                ...comment,
                replies: [
                  { id: comment.replies.length + 1, author: "You", text: `@${replyTo.author} ${newComment}`, likes: 0, liked: false },
                  ...comment.replies,
                ],
              }
            : comment
        )
      );
    } else {
      setCommentsList([
        { id: commentsList.length + 1, author: "You", text: newComment, likes: 0, liked: false, replies: [] },
        ...commentsList
      ]);
    }

    setNewComment("");
    setReplyTo(null);
    setModalVisible(false);
  };

  // Like toggle for comments & replies
  const toggleLike = (commentId, isReply = false, replyId = null) => {
    setCommentsList((prev) =>
      prev.map((comment) =>
        comment.id === commentId
          ? isReply
            ? {
                ...comment,
                replies: comment.replies.map((reply) =>
                  reply.id === replyId
                    ? { ...reply, liked: !reply.liked, likes: reply.liked ? reply.likes - 1 : reply.likes + 1 }
                    : reply
                ),
              }
            : { ...comment, liked: !comment.liked, likes: comment.liked ? comment.likes - 1 : comment.likes + 1 }
          : comment
      )
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Header Section */}
        <View className=" bg-emerald-800 px-6 pt-10 pb-14 rounded-b-3xl shadow-md">
          <View className="flex-row items-center">
            <View className={`${bgColor} p-3 rounded-full`}>
              <MaterialIcons name="forum" size={28} color={iconColor.replace("text-", "")} />
            </View>
            <Text className="text-white text-3xl font-bold ml-4">{title}</Text>
          </View>
          <Text className="text-green-100 text-lg mt-2">{description}</Text>
          <Text className="text-green-200 mt-2">Started by {createdBy}</Text>
        </View>

        {/* Comments Section */}
        <View className="px-6 mt-8">
          <Text className="text-xl font-bold text-gray-800 mb-4">Discussion</Text>

          {commentsList.map((comment) => (
            <View key={comment.id} className="bg-white p-4 rounded-xl shadow-sm mb-3">
              <Text className="text-gray-800 font-bold">{comment.author}</Text>
              <Text className="text-gray-700 mt-1">{comment.text}</Text>

              <View className="flex-row justify-between items-center mt-2">
                <TouchableOpacity className="flex-row items-center" onPress={() => toggleLike(comment.id)}>
                  <Ionicons name={comment.liked ? "heart" : "heart-outline"} size={20} color={comment.liked ? "#2563EB" : "#666"} />
                  <Text className="ml-2">{comment.likes}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setReplyTo(comment); setModalVisible(true); }}>
                  <Text className="text-blue-600">Reply</Text>
                </TouchableOpacity>
              </View>

              {comment.replies.map((reply) => (
                <View key={reply.id} className="ml-6 mt-2 bg-gray-100 p-3 rounded-lg">
                  <Text className="text-gray-800 font-bold">{reply.author}</Text>
                  <Text className="text-gray-700">{reply.text}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Floating Button to Open Modal */}
      <TouchableOpacity className="absolute bottom-6 right-6 bg-green-600 w-14 h-14 rounded-full items-center justify-center shadow-lg" onPress={() => setModalVisible(true)}>
        <Ionicons name="chatbubble-ellipses" size={30} color="white" />
      </TouchableOpacity>

      {/* Modal for Adding Comment/Reply */}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6 shadow-lg">
            {/* Modal Header */}
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-800">
                {replyTo ? `Reply to ${replyTo.author}` : 'Add Comment'}
              </Text>
              <TouchableOpacity 
                onPress={() => {
                  setModalVisible(false);
                  setReplyTo(null);
                  setNewComment('');
                }}
                className="p-2"
              >
                <MaterialIcons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            {/* Reply Context (shown only when replying) */}
            {replyTo && (
              <View className="bg-gray-50 p-4 rounded-xl mb-4">
                <Text className="text-gray-500 text-sm mb-1">Replying to:</Text>
                <Text className="text-gray-700 font-medium">{replyTo.text}</Text>
              </View>
            )}

            {/* Input Area */}
            <View className="bg-gray-50 rounded-xl p-2 mb-4">
              <TextInput
                placeholder={replyTo ? "Write your reply..." : "Share your thoughts..."}
                value={newComment}
                onChangeText={setNewComment}
                className="min-h-[100] p-3 text-gray-800"
                multiline
                textAlignVertical="top"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Action Buttons */}
            <View className="flex-row justify-end space-x-3">
              <TouchableOpacity 
                onPress={() => {
                  setModalVisible(false);
                  setReplyTo(null);
                  setNewComment('');
                }}
                className="px-6 py-3 rounded-xl bg-gray-100"
              >
                <Text className="text-gray-700 font-semibold">Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={addComment}
                className={`px-6 py-3 rounded-xl ${
                  newComment.trim() ? 'bg-emerald-800' : 'bg-emerald-800/50'
                }`}
                disabled={!newComment.trim()}
              >
                <Text className="text-white font-semibold">
                  {replyTo ? 'Reply' : 'Post'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Safe Area Spacer for iOS */}
            <View className="h-6" />
          </View>
        </View>
      </Modal>

      {/* Floating Action Button */}
      <TouchableOpacity 
        className="absolute bottom-6 right-6 bg-emerald-800 w-14 h-14 rounded-full items-center justify-center shadow-lg"
        onPress={() => {
          setReplyTo(null);
          setNewComment('');
          setModalVisible(true);
        }}
      >
        <MaterialIcons name="chat" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
