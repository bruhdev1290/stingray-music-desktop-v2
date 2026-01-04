<template>
  <SideSheetButton
    v-koel-tooltip.left
    :title="shouldNotifyNewVersion ? 'New version available!' : `About ${appName}`"
    @click.prevent="openAboutStingrayModal"
  >
    <Icon :icon="faInfoCircle" />
    <span
      v-if="shouldNotifyNewVersion"
      class="absolute w-[10px] aspect-square right-px top-px rounded-full bg-k-highlight"
      data-testid="new-version-indicator"
    />
  </SideSheetButton>
</template>

<script lang="ts" setup>
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import { eventBus } from '@/utils/eventBus'
import { useNewVersionNotification } from '@/composables/useNewVersionNotification'
import { useBranding } from '@/composables/useBranding'

import SideSheetButton from '@/components/layout/main-wrapper/side-sheet/SideSheetButton.vue'

const { shouldNotifyNewVersion } = useNewVersionNotification()
const { name: appName } = useBranding()

// Note: Event name MODAL_SHOW_ABOUT_KOEL is kept for backward compatibility.
// It's an internal identifier and doesn't affect user-facing functionality.
const openAboutStingrayModal = () => eventBus.emit('MODAL_SHOW_ABOUT_KOEL')
</script>
