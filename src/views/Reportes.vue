<template>
  <div>
    <h2>Reportes</h2>
    <b-tabs class="bg-light" pills card>
      <b-tab title="Reporte existencias">
        <reporte-existencias></reporte-existencias>
      </b-tab>
      <b-tab title="Reporte por cantidad" disabled>
        <inventario-por-cantidad></inventario-por-cantidad>
      </b-tab>
    </b-tabs>
  </div>
</template>
<script>
import InventarioPorCantidad from '@/components/reportes/InventarioPorCantidad'
import ReporteExistencias from '@/components/reportes/ReporteExistencias'
import firebase from 'firebase/app'
import XLSX from 'xlsx'
export default {
    components: {
        InventarioPorCantidad,
        ReporteExistencias
    }

}
</script>
