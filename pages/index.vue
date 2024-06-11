<template>
  <v-container class="main-container">
    <v-row>
      <v-col v-for="post in newsFeed" :key="post.id" cols="12">
        <v-card class="news-card">
          <v-card-title class="news-title">{{ formatDate(post.date) }}</v-card-title>
          <v-card-text class="news-text">{{ post.text }}</v-card-text>
          <v-card-actions class="news-actions">
            <span class="news-like">{{ post.likes }}</span>
            <v-btn :disabled="post.liked" @click="likePost(post.id)">Like</v-btn>
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
    this.$socket.on('news', (data) => {
      console.log('Received news:', data);
      this.newsFeed = data.map(post => ({ ...post, liked: false }));
    });

    this.$socket.on('like', ({ postId, likes }) => {
      const post = this.newsFeed.find(p => p.id === postId);
      if (post) {
        post.likes = likes;
        post.liked = true; // Маркуємо пост як лайкнутий
      }
    });

    console.log('Requesting news...');
    this.$socket.emit('get_news');
  },
  methods: {
    likePost(postId) {
      console.log('Liking post:', postId);
      this.$socket.emit('like', postId);
    },
    addPost() {
      console.log('Adding post:', this.newPostText);
      const newPost = { text: this.newPostText, date: new Date().toISOString(), id: Date.now(), likes: 0 };
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
}

.news-title, .news-text {
  color: #333333 !important;
}

.news-actions {
  display: flex;
  justify-content: flex-end !important;
  align-items: center;
}

.news-like {
  margin-right: 20px;
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
