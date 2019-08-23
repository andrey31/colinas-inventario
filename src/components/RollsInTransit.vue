<template>
  <div>
    <b-row class="my-2">
      <b-col cols="12">
        <b-button variant="primary"
                  :disabled="(countSelectRolls <= 0)"
                  @click="showModalSendRolls = true">
          Registrar rollos
        </b-button>
      </b-col>
    </b-row>
    <b-table :items="rollosEnTransitoFilter" :fields="fieldsRolls">
      <template slot="kgs" slot-scope="row">
        {{Number(row.item.kgs).toFixed(2)}}
      </template>
      <template slot="enTransito" slot-scope="row">
        <label v-if="row.item.enTransito">Sí</label>
        <label v-else>No</label>
      </template>
      <template slot="enAlmacen" slot-scope="row">
        <b-form-checkbox v-if="row.item.enTransito" v-model="rollsCheck" :value="row.item"
                         :disabled="rollsNotCheck.includes(row.item)" v-b-tooltip.hover :title="row.item.idNumber">
        </b-form-checkbox>
      </template>
      <template slot="noLlego" slot-scope="row">
        <b-form-checkbox v-if="row.item.enTransito && !row.item.comentarioNoLlego" v-model="rollsNotCheck" :value="row.item"
                         :disabled="rollsCheck.includes(row.item)" v-b-tooltip.hover :title="row.item.idNumber">
        </b-form-checkbox>
        <label for="" v-if="row.item.enTransito && row.item.comentarioNoLlego">{{row.item.comentarioNoLlego}}</label>
      </template>
    </b-table>
    <b-modal v-model="showModalSendRolls"
             header-bg-variant="primary"
             no-close-on-backdrop
             size="lg"
             >
      <template slot="modal-title">
        Registrar
      </template>
      <div class="text-center" v-if="rollsCheck.length > 0">
        Se registrarán los siguientes rollos en el almacen:
        <ul>
          <li v-for="roll in rollsCheck">{{roll.idNumber}}</li>
        </ul>
      </div>
      <div class="text-center" v-if="rollsNotCheck.length > 0">
        Por favor, ingrese un comentario de porque el rollo no llegó:
        <ul>
          <li v-for="roll in rollsNotCheck">
            <b-row class="pt-2">
              <b-col cols="2" class="pt-1" offset="1">{{roll.idNumber}}</b-col>
              <b-col cols="8">
                <b-form-input v-model="roll.comentarioNoLlego" placeholder="Ingrese comentario"></b-form-input>
              </b-col>
            </b-row>
          </li>

        </ul>
      </div>
      <div slot="modal-footer" class="">
        <b-button variant="danger" class="mr-2" @click="showModalSendRolls = false">Cancelar</b-button>
        <b-button variant="primary" @click="sendRollsToAlmacen">Enviar</b-button>
      </div>
    </b-modal>
  </div>
</template>
<script>
import firebase from 'firebase/app'
export default {
    props: ['rollosEnTransito'],
    computed: {
        rollosEnTransitoFilter: function(){
            let filter = this.rollosEnTransito.filter( el => {
                if (el.comentarioNoLlego) el._rowVariant = 'danger'
                return el.enTransito === true
            })
            return filter
        },
        countSelectRolls: function(){
            return this.rollsCheck.length + this.rollsNotCheck.length
        },
    },
    data(){
        return {
            db: firebase.database(),
            fieldsRolls: [
                {key: 'idNumber', label: 'Numero de rollo'},
                'fecha',
                {key: 'meters', label: 'Metros lineales'},
                'gramaje',
                {key: 'width', label: 'Ancho'},
                {key: 'typePaper', label: 'Tipo de papel'},
                {key: 'kgs', label: 'Kilogramos'},
                'enTransito',
                'enAlmacen',
                {key: 'noLlego', label: 'No llegó'},
                {key: 'comments', label: 'Comentario'},
            ],
            rollsCheck: [],
            rollsNotCheck: [],
            showModalSendRolls: false
        }
    },
    methods: {
        sendRollsToAlmacen: function(){
            this.rollsNotCheck.forEach( roll => {
                this.db.ref(roll.almacen+'EnTransito').child(roll.idNumber).update(
                    {
                        comentarioNoLlego: roll.comentarioNoLlego,
                    }
                ).then( (data) => {
                    roll._rowVariant = 'danger'
                })
            })

            this.rollsCheck.forEach( (roll, index, arr) => {

                let r = {
                    comments: roll.comments,
                    fecha: roll.fecha,
                    gramaje: roll.gramaje,
                    idNumber: roll.idNumber,
                    kgs: roll.kgs,
                    meters: roll.meters,
                    typePaper: roll.typePaper,
                    width: roll.width,
                    dua: ''
                }
                this.db.ref(roll.almacen).child(r.idNumber).set(r).then((data) => {
                    let rollId = r.idNumber
                    this.db.ref((roll.almacen)+'EnTransito').child(rollId).update(
                        {
                            enTransito: false
                        }
                    ).then( (data) => {
                        roll.enTransito = false
                        roll._rowVariant = 'danger'

                        console.log('en transito actualizado')
            if (index === arr.length - 1 ) this.showModalSendRolls = false
          }).catch( error => {
            console.log('error transito no actualizado ' +error)
          })
          console.log('agregdo '+r.idNumber)
        }).catch( error => {
          console.log('error')
        })
      })
      this.rollsCheck = []
      this.rollsNotCheck = []
    },
    }
}
</script>
