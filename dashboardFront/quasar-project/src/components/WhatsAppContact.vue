<template>
  <span class="pa-whatsapp-contact">
    <span>{{ phone || fallback }}</span>
    <q-btn
      v-if="whatsAppUrl"
      class="pa-whatsapp-contact__action"
      flat
      round
      dense
      size="sm"
      color="positive"
      icon="chat"
      :href="whatsAppUrl"
      target="_blank"
      rel="noopener noreferrer"
      :aria-label="`Enviar mensagem pelo WhatsApp para ${phone}`"
    >
      <q-tooltip>Enviar mensagem pelo WhatsApp</q-tooltip>
    </q-btn>
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  phone: {
    type: String,
    default: ''
  },
  fallback: {
    type: String,
    default: 'Telefone não informado'
  }
})

const whatsAppUrl = computed(() => {
  const digits = props.phone.replace(/\D/g, '')
  if (digits.length < 10) return ''

  const internationalNumber =
    (digits.length === 10 || digits.length === 11) && !digits.startsWith('55')
      ? `55${digits}`
      : digits

  return `https://wa.me/${internationalNumber}`
})
</script>

<style scoped>
.pa-whatsapp-contact {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.pa-whatsapp-contact__action {
  opacity: 0;
  transition: opacity 150ms ease;
}

.pa-whatsapp-contact:hover .pa-whatsapp-contact__action,
.pa-whatsapp-contact:focus-within .pa-whatsapp-contact__action {
  opacity: 1;
}

@media (hover: none) {
  .pa-whatsapp-contact__action {
    opacity: 1;
  }
}
</style>
