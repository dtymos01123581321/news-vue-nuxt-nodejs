<template>
  <v-container class="main-container">
    <v-row>
      <v-col v-for="post in newsFeed" :key="post.id" cols="12">
        <v-card class="news-card">
          <v-card-title class="news-title">{{ formatDate(post.date) }}</v-card-title>
          <v-card-text class="news-text">{{ post.text }}</v-card-text>
          <v-card-actions>
            <v-btn :disabled="post.liked" @click="likePost(post.id)">Like</v-btn>
            <span>{{ post.likes }}</span>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <v-form @submit.prevent="addPost">
      <v-textarea v-model="newPostText" label="New Post" class="new-post-textarea"></v-textarea>
      <v-btn type="submit">Add</v-btn>
    </v-form>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      newsFeed: [],
      newPostText: ''
    };
  },
  mounted() {
    this.$socket.on('news', (news) => {
      console.log('Received news:', news);
      this.newsFeed = news;
    });
    this.$socket.on('like', ({ postId, likes }) => {
      console.log('Received like:', postId, likes);
      const post = this.newsFeed.find(p => p.id === postId);
      if (post) post.likes = likes;
    });
    this.$socket.emit('get_news');
  },
  methods: {
    likePost(postId) {
      console.log('Liking post:', postId);
      this.$socket.emit('like', postId);
      const post = this.newsFeed.find(p => p.id === postId);
      if (post) post.liked = true;
    },
    addPost() {
      console.log('Adding post:', this.newPostText);
      const newPost = { text: this.newPostText, date: new Date(), id: Date.now(), likes: 0 };
      this.$socket.emit('new_post', newPost);
      this.newPostText = '';
    },
    formatDate(date) {
      return new Date(date).toLocaleString();
    }
  }
};
</script>

<style scoped>
.main-container {
  background-color: #ffffff;
  padding-top: 20px;
}

.news-card {
  background-color: #f5ceaa;
  color: #333333;
  border: 1px solid #d3d3d3;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;

  span {
    margin-left: 10px;
  }
}

.news-title, .news-text {
  color: #333333 !important;
}

.v-card-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.v-btn {
  background-color: #6200ea;
  color: #ffffff;
}

.new-post-textarea {
  color: #ffffff !important;
  background-color: #ccc !important;
  padding: 20px;
  border: 1px solid #d3d3d3;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  margin-bottom: 10px;
}

.theme--dark.v-btn.v-btn--disabled {
  color: white !important;
}

</style>
