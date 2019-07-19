<template>
<b-container fluid>

  <h2>Registro de cambios</h2>

  <b-tabs class="bg-light" pills card>
    <b-table
      :items="changes"
      >

    </b-table>
  </b-tabs>
</b-container>
</template>

<script>
import firebase from 'firebase/app'
export default {
  name: 'registro-cambios',
  mounted() {
    this.db.ref('/CambiosRealizados')
      .on('value', snapshot => {
        this.changes = []
        this.loadChanges(snapshot.val())
      })
  },
  data(){
    return  {
      db: firebase.database(),
      currentUser: firebase.auth().currentUser,
      changes: []

    }
  },
  methods: {
    loadChanges: function(data){
      for (let key in data){
        this.changes.push( {
          cambioRealizado: data[key].cambioRealizado,
          fecha: data[key].fecha,
          hora: data[key].hora,
          nota: data[key].nota,
          numRollo: data[key].numRollo,
          ubicacion: data[key].ubicacion,
          usuario: data[key].usuario
        })
      }
    }
  }

}
</script>
