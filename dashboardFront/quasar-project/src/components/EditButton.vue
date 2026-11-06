<template>
  <q-btn
    flat
    round
    dense
    color="primary"
    icon="edit"
    :aria-label="label"
    @click="emit('click', $event)"
  >
    <q-tooltip>{{ label }}</q-tooltip>
  </q-btn>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    default: 'Editar'
  }
})

const emit = defineEmits(['click'])
</script>
