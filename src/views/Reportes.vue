<template>
<div>
  <h2>Reportes</h2>
  <b-tabs class="bg-light" pills card>
    <b-tab title="Reporte existencias">
      <reporte-existencias></reporte-existencias>
    </b-tab>
    <b-tab title="Reporte de consumos">
      <reporte-consumos></reporte-consumos>
    </b-tab>
    <b-tab title="Reporte de desperdicios">
      <label slot="title">Reporte de desperdicios</label>
      <reporte-desperdicios></reporte-desperdicios>
    </b-tab>
    <b-tab title="Reporte de producción">
      <label slot="title">Reporte de lotes de producción</label>
      <reporte-produccion></reporte-produccion>
    </b-tab>
    <!-- <b-tab title="Reporte por cantidad" disabled> -->
    <!--   <inventario-por-cantidad></inventario-por-cantidad> -->
    <!-- </b-tab> -->

  </b-tabs>
</div>
</template>
<script>
import InventarioPorCantidad from '@/components/reportes/InventarioPorCantidad'
import ReporteExistencias from '@/components/reportes/ReporteExistencias'
import ReporteConsumos from '@/components/reportes/ReporteConsumos'
import ReporteDesperdicios from '@/components/reportes/ReporteDesperdicios'
import ReporteProduccion from '@/components/reportes/ReporteProduccion'

import firebase from 'firebase/app'
import XLSX from 'xlsx'

export default {
    components: {
        InventarioPorCantidad,
        ReporteExistencias,
        ReporteConsumos,
        ReporteDesperdicios,
        ReporteProduccion
    }

}
</script>
