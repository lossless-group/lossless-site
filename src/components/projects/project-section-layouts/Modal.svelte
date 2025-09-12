<script lang="ts">
  // Svelte 5 runes API
  let { open = $bindable(), onClose = () => {}, title = 'Modal', children } = $props();

  let dialog: HTMLDialogElement;

  $effect(() => {
    if (!dialog) return;
    if (open) {
      if (!dialog.open) dialog.showModal();
    } else {
      if (dialog.open) dialog.close();
    }
  });

  function handleDialogClose() {
    // Keep bound state in sync when user closes via ESC or backdrop
    if (open) open = false;
    onClose();
  }

  function handleDialogClick(e: MouseEvent) {
    if (e.target === dialog) dialog.close();
  }
</script>

<dialog
  bind:this={dialog}
  aria-modal="true"
  aria-labelledby="modal-title"
  onclose={handleDialogClose}
  onclick={handleDialogClick}
>
  <div class="clr-primary-bg">
    <button class="close-btn" aria-label="Close" onclick={() => dialog.close()}>×</button>    
    <h2 id="modal-title">{title}</h2>
    <hr />
    {@render children?.()}
  </div>
</dialog>

<style>
  dialog {
    width: calc(100vw - 10rem);
    height: calc(100vh - 10rem);
    background-color: var(--clr-stolen--github--dark);
    max-width: none;    
    max-height: none;
    margin: 5rem;
    border-radius: 0.2em;
    border: none;
    padding: 0;
  }
  dialog::backdrop {
    background: rgba(0, 0, 0, 0.3);
  }
  dialog > div {
    padding: 1em;
    position: relative;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    overflow: auto;
  }
  dialog[open] {
    animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  @keyframes zoom {
    from {
      transform: scale(0.95);
    }
    to {
      transform: scale(1);
    }
  }
  dialog[open]::backdrop {
    animation: fade 0.2s ease-out;
  }
  @keyframes fade {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  button {
    display: block;
  }
  .close-btn {
    position: absolute;
    top: 0.5em;
    right: 0.5em;
    border: none;
    background: transparent;
    font-size: 1.25em;
    line-height: 1;
    cursor: pointer;
    opacity: 0.7;
    color: white;
  }
  .close-btn:hover {
    opacity: 1;
  }
</style>
