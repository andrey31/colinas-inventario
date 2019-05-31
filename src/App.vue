<template>
<div id="app">
  <div id="nav" v-if="this.$route.path != '/login'">
    <router-link to="/home">Inicio</router-link> |
    <router-link to="/packing-list">Packing List</router-link> |
    <router-link to="/inventario">Inventario</router-link> |
    <!-- <router-link to="/about">Acerca de</router-link> -->
    <a @click.prevent="logout()" href="">Salir</a>
    </div>
    <router-view/>
  </div>
</template>

<script>
import firebase from 'firebase/app'
export default{
    methods: {
        logout: function(){
            firebase.auth().signOut().then( () => {
                this.$router.replace('login')
            })
        }
    }
}
</script>
<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
