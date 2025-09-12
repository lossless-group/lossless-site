<script lang="ts">
  import { onDestroy } from 'svelte';

  export let open: boolean;
  export let onClose: () => void = () => {};
  export let title: string = 'Modal';

  let previousBodyOverflow: string | null = null;

  $: if (typeof document !== 'undefined') {
    if (open) {
      if (previousBodyOverflow === null) {
        previousBodyOverflow = document.body.style.overflow || '';
      }
      document.body.style.overflow = 'hidden';
    } else {
      if (previousBodyOverflow !== null) {
        document.body.style.overflow = previousBodyOverflow;
        previousBodyOverflow = null;
      }
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (!open) return;
    if (e.key === 'Escape') onClose();
  }

  function handleOverlayClick(e: MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  function handleOverlayKeydown(e: KeyboardEvent) {
    if (e.target !== e.currentTarget) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClose();
    }
  }

  onDestroy(() => {
    if (previousBodyOverflow !== null) {
      document.body.style.overflow = previousBodyOverflow;
      previousBodyOverflow = null;
    }
  });
</script>

<svelte:window on:keydown={handleKeydown} />

{#if open}
  <div
    class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50"
    role="button"
    tabindex="0"
    aria-label="Close modal"
    on:click={handleOverlayClick}
    on:keydown={handleOverlayKeydown}
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      class="relative w-[min(90vw,560px)] rounded-xl bg-white p-6 shadow-xl"
    >
      <button
        on:click={onClose}
        class="absolute right-3 top-3 rounded-md px-2 py-1 text-gray-600 hover:bg-gray-100"
        aria-label="Close"
      >
        ✕
      </button>
      <h2 id="modal-title" class="mb-3 text-xl font-semibold">{title}</h2>
      <slot />
    </div>
  </div>
{/if}


