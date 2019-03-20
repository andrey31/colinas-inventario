<template>
<b-container>
  <b-row>
    <b-col>
      <b-alert dismissible v-model="showAlert">Se agregó packinglist {{ourOrder}}</b-alert>
    </b-col>
    <b-col cols="12" class="mb-4">
      <b-form-file
        v-model="file"
        :state="Boolean(file)"
        placeholder="Escoja el archivo .xls..."
        drop-placeholder="Arrastre el archivo aquí..."
        @change="clear"
        class="mb-2"
        />
      <b-button @click="load">Cargar</b-button>
      <b-button @click="uploadFile" variant="primary" class="mx-2" :disabled="disabledUpload">Subir a base de datos</b-button>
    </b-col>
    <b-col cols="6" offset="3" v-if="spinner">
      <strong class="mr-2">{{textSpinner}}</strong>
      <b-spinner variant="primary" label="Loading..." />
    </b-col>

    <b-col cols="12">
      <b-alert variant="danger" v-model="showAlertExist">Esta packing list ya se encuentra almacenado en la base de datos</b-alert>
    </b-col>
    <template v-if="provided !== ''">
      <b-col cols="4" class="bg-light">
        <p><b>Provided: </b> {{provided}}</p>
        <p><b>Date: </b>{{date}}</p>
        <p><b>Shipped: </b>{{shipped}}</p>
        <p><b>Shipment: </b>{{shipment}}</p>
      </b-col>

      <b-col cols="4" class="bg-light">
        <p><b>Carrier: </b>{{carrier}}</p>
        <p><b>Vehicle: </b>{{vehicle}}</p>
        <p><b>Booking: </b>{{booking}}</p>
      </b-col>
      <b-col cols="4" class="bg-light">
        <p><b>Our order: </b>{{ourOrder}}</p>
        <p><b>Your order: </b>{{yourOrder}}</p>
        <p><b>Comment: </b>{{comment}}</p>
      </b-col>
    </template>

    <b-col>
      <b-table
        :items="arrayData"
        >
      </b-table>
    </b-col>
  </b-row>
</b-container>

</template>

<script>
import firebase from 'firebase/app'
export default{
    name: 'ReadExcel',
    computed: {
    },
    data(){
        return{
            file: null,
            arrayxls: null,
            arrayData: [],
            provided: '',
            date: '',
            shipped: '',
            shipment: '',
            carrier: '',
            vehicle: '',
            booking: '',
            comment: '',
            ourOrder: '',
            yourOrder: '',
            db: firebase.database(),
            spinner: false,
            textSpinner: 'Subiendo excel...',
            disabledUpload: true,
            showAlert: false,
            showAlertExist: false
        }
    },
    methods: {
        clear: function(){
            this.arrayxls = null
            this.provided = ''
            this.arrayData = []
            this.date = ''
            this.ourOrder = ''
            this.shipped = ''
            this.yourOrder = ''
            this.vehicle = ''
            this.showAlert = false,
            this.showAlertExist = false

        },
        uploadFile: function(){
            this.spinner = true
            let storageRef = firebase.storage().ref();

            let file = this.file

            let metadata = {
                contentType: 'application/vnd.ms-excel'
            }

            let uploadTask = storageRef.child('packing-list/'+this.ourOrder+'.xlsx').put(file, metadata)

            // Listen for state changes, errors, and completion of the upload.
            uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
                          snapshot => {
                              // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                              var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                              this.textSpinner = 'Subiendo '+progress + '%'
                              console.log('Upload is ' + progress + '% done');
                              switch (snapshot.state) {
                              case firebase.storage.TaskState.PAUSED: // or 'paused'
                                  console.log('Upload is paused');
                                  break;
                              case firebase.storage.TaskState.RUNNING: // or 'running'
                                  console.log('Upload is running');
                                  break;
                              }
                          }, error => {

                              // A full list of error codes is available at
                              // https://firebase.google.com/docs/storage/web/handle-errors
                              switch (error.code) {
                              case 'storage/unauthorized':
                                  // User doesn't have permission to access the object
                                  this.textSpinner = 'Error, no authorizado'
                                  break;

                              case 'storage/canceled':
                                  this.textSpinner = 'Error, subida cancelada'
                                  // User canceled the upload
                                  break;

                              case 'storage/unknown':
                                  this.textSpinner = 'Error, intentelo nuevamente'
                                  // Unknown error occurred, inspect error.serverResponse
                                  break;
                              }
                          }, () =>{
                              // Upload completed successfully, now we can get the download URL
                              uploadTask.snapshot.ref.getDownloadURL().then( (downloadURL) => {
                                  console.log('File available at', downloadURL);
                                  // this.upload()
                                  this.upload(downloadURL)
                              });
                          });

        },

        upload: function(downloadURL){
            // Subir datos a firebase
            this.textSpinner = 'Subiendo datos ...'
            let arrayKeys = []
            this.arrayData.forEach( packing => {
                let key = this.db.ref('packing-list').push().key;
                this.db.ref('packing-list').child(key).set(packing)
                    .then((data) => {
                        this.spinner = false
                        console.log('Agregado packing-list')
                        this.disabledUpload = true
                        this.showAlert = true
                    })
                    .catch(error => {
                        this.textSpinner = 'Ocurrió un error al subir los datos'
                    })
                arrayKeys.push(key)

                arrayKeys.length === this.arrayData.length ? this.uploadOrder(arrayKeys, downloadURL) : null
            })
            // this.uploadFile()
        },
        uploadOrder: function(uids, downloadURL){
            this.db.ref('order').push({
                'provided': this.provided,
                'date': this.date,
                'shipped': this.shipped,
                'shipment': this.shipment,
                'carrier': this.carrier,
                'vehicle': this.vehicle,
                'booking': this.booking,
                'comment': this.comment,
                'ourOrder': this.ourOrder,
                'yourOrder': this.yourOrder,
                'packing-list': uids,
                'downloadXLS': downloadURL
            })
        },
        load: function(){
            if(this.file != null){
                this.transformXLS()
                this.showAlert = false
            }

        },
        getListRolls: function(){

            this.arrayData = []
            console.log(this.arrayxls.length)
            // menos 3 los campos no necesarios datos como total y el uno del arreglo
            for(let i = 8; i<= (this.arrayxls.length - 3); ++i){
                let a = Object.values(this.arrayxls[i])
                this.arrayData.push(
                    {
                        'idNumber': a[0],
                        'weight': a[1],
                        'tons': a[2],
                        'lineal': a[3],
                        'width': a[4],
                        'paperGrade': a[5],
                        'comments': a[6] === null ? a[6] : '',
                    }
                )
            }

        },
        existsPackingList: function(){
            let storageRef = firebase.storage().ref();
            let xls = storageRef.child('packing-list/'+this.ourOrder+'.xlsx')

            xls.getDownloadURL().then(url => {
                this.disabledUpload = true
                this.showAlertExist = true
                console.log('exist')

            }).catch(error => {
                if (error.code === 'storage/object-not-found'){
                    this.disabledUpload = false
                    this.showAlertExist = false
                    console.log('no exist')
                }
                else{
                    console.log('exist')
                    this.disabledUpload = true
                    this.showAlertExist = true
                }
            })

        },
        othersData: function(){
            this.provided = Object.keys(this.arrayxls[0])[1]
            this.date = this.transformDate(Object.values(this.arrayxls[0])[1])
            this.vehicle = Object.values(this.arrayxls[0])[3]
            this.ourOrder = Object.values(this.arrayxls[0])[5]
            this.shipped = this.transformDate(Object.values(this.arrayxls[1])[1])
            this.booking = Object.values(this.arrayxls[1])[3]
            this.yourOrder = Object.values(this.arrayxls[1])[5]
            this.shipment = Object.values(this.arrayxls[2])[1]
            this.comment = Object.values(this.arrayxls[2])[3]
            this.carrier = Object.values(this.arrayxls[3])[1]
            this.existsPackingList()
        },
        transformDate: function(date){
            //Tranformar fecha excel la devuelve en entero
            let d = new Date(Math.round((date - 25569)*86400*1000));
            let format = (d.getDate()+1) + '/' + (d.getMonth()+1) + '/' + (d.getFullYear())
            return format
        },
        transformXLS: function(){
            /* set up XMLHttpRequest */
            var url = URL.createObjectURL(this.file)
            var oReq = new XMLHttpRequest();
            oReq.open("GET", url, true);
            oReq.responseType = "arraybuffer";
            oReq.onload = e => {
                var arraybuffer = oReq.response;

                /* convert data to binary string */
                var data = new Uint8Array(arraybuffer);
                var arr = new Array();
                for (var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
                var bstr = arr.join("");

                /* Call XLSX */
                var workbook = XLSX.read(bstr, {
                    type: "binary"
                });

                /* DO SOMETHING WITH workbook HERE */
                var first_sheet_name = workbook.SheetNames[0];
                /* Get worksheet */
                var worksheet = workbook.Sheets[first_sheet_name];

                this.arrayxls = XLSX.utils.sheet_to_json(worksheet, {
                    raw: true
                })
                //LLama metodos cuando el excel ya ha
                this.getListRolls()
                this.othersData()


            }
            oReq.send();

        }
    }
}

</script>

<style>

.custom-file-input:lang(en) ~ .custom-file-label::after {
  content: 'Buscar';
}
.custom-file-input:lang(es) ~ .custom-file-label::after {
  content: 'Buscar';
}
</style>
