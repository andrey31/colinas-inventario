<template>
<b-container class="bg-container">
  <b-row class="first-row">

    <b-col cols="12" md="6" offset-md="3">
      <b-alert v-model="showAlert" variant="danger">Usuario incorrecto</b-alert>

      <b-form @submit.prevent="login" class="form-login bg-info">
        <!-- <label for="inputEmail">Correo</label> -->
        <!-- <b-input id="inputEmail"></b-input> -->
        <b-form-group
          id="email"
          label="Correo"
          label-for="inputEmail"
          class="custom-text"
          >
          <!-- 'omar.duran@corrugadosaltavista.com', -->
          <!-- 'guillermo.hernandez@corrugadosaltavista.com', -->
          <!-- 'jose.rodriguez@corrugadosaltavista.com', -->
          <!-- 'contabilidad@corrugadosaltavista.com', -->
          <!-- 'jose.mora@corrugadosaltavista.com', -->
          <!-- 'montacargas1@corrugadosaltavista.com', -->
          <!-- 'montacargas2@corrugadosaltavista.com', -->
          <!-- 'operador1@corrugadosaltavista.com', -->
          <!-- 'operador2@corrugadosaltavista.com' -->
          <b-form-select v-model="form.email">
            <option value="omar.duran@corrugadosaltavista.com">omar.duran@corrugadosaltavista.com</option>
            <option value="guillermo.hernandez@corrugadosaltavista.com">guillermo.hernandez@corrugadosaltavista.com</option>
            <option value="jose.rodriguez@corrugadosaltavista.com">jose.rodriguez@corrugadosaltavista.com</option>
            <option value="contabilidad@corrugadosaltavista.com">contabilidad@corrugadosaltavista.com</option>
            <option value="jose.mora@corrugadosaltavista.com">jose.mora@corrugadosaltavista.com</option>
            <option value="jennifer@corrugadosaltavista.com">jennifer@corrugadosaltavista.com</option>
            <option value="ronny@corrugadosaltavista.com">ronny@corrugadosaltavista.com</option>
            <!-- <option value="eduardo@corrugadosaltavista.com">eduardo@corrugadosaltavista.com</option>
            <option value="rigo@corrugadosaltavista.com">rigo@corrugadosaltavista.com</option> -->
            <option value="alexander@corrugadosaltavista.com">alexander@corrugadosaltavista.com</option>
            <option value="jackson@corrugadosaltavista.com">jackson@corrugadosaltavista.com</option>
            <option value="josue@corrugadosaltavista.com">josue@corrugadosaltavista.com</option>
            <option value="sandro@corrugadosaltavista.com">sandro@corrugadosaltavista.com</option>
            <option value="wilmar@corrugadosaltavista.com">wilmar@corrugadosaltavista.com</option>
            <!-- <option value="montacargas1@corrugadosaltavista.com">montacargas1@corrugadosaltavista.com</option> -->
            <!-- <option value="montacargas2@corrugadosaltavista.com">montacargas2@corrugadosaltavista.com</option> -->
            <!-- <option value="operador1@corrugadosaltavista.com">operador1@corrugadosaltavista.com</option> -->
            <!-- <option value="operador2@corrugadosaltavista.com">operador2@corrugadosaltavista.com</option> -->
            <option value="admin@corrugadosaltavista.com">admin@corrugadosaltavista.com</option>
            <!-- <option value="a">Option A</option> -->
            <!-- <option value="b" disabled>Option B (disabled)</option> -->
          </b-form-select>
          <!-- <b-form-input -->
          <!--   id="inputEmail" -->
          <!--   type="text" -->
          <!--   v-model="form.email" -->
          <!--   required -->
          <!--   placeholder="Ingrese su email" -->
          <!--   > -->

         <!--  </b-form-input> -->

        </b-form-group>

        <b-form-group
          id="pass"
          label="Contraseña"
          label-for="inputPass"
          class="custom-text"
          >
          <b-form-input
            id="inputPass"
            type="password"
            v-model="form.password"
            required
            placeholder="Ingrese su contraseña"
            >

          </b-form-input>
        </b-form-group>

        <b-button type="submit" variant="dark" size="lg">Ingresar</b-button>

        </b-form>

      </b-col>

    </b-row>
  </b-container>
</template>
<script>
import firebase from 'firebase/app'
export default{
  name: 'Login',
  data(){
    return {
      form: {
        email: '',
        password: '',
      },
      showAlert: false,
    }
  },
  methods: {
    login: function(){
      // evt.preventDefault()
      // let dominio = '@corrugadosaltavista.com'
      // if (!(this.form.email).includes(dominio)) this.form.email += dominio
      firebase.auth().signInWithEmailAndPassword(this.form.email, this.form.password).then(
        (user) => {
           this.$router.replace('home')
        },
        (err) => {
          alert(err.message)
        }

      )
    }
  }
}
</script>
<style scoped>
.first-row{
    padding-top: 80px
}
.custom-text{
    color: #ffffff;
    font-size: 18px;
}
.form-login{
    /* background: #f5f5f5; */

    /* top | right | bottom | left */
    padding-top: 50px;
    padding-bottom: 50px;
    padding-left: 30px;
    padding-right: 30px;
    /* border: 2px solid ; */
    border-radius: 10px;

    /* border: 4px solid black; */

}
/* #body{ */
/*     /\* background-color: #ececece6; *\/ */
/* } */


</style>
