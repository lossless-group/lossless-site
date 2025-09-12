<script lang="ts">
  import Modal from './Modal.svelte';
  import JSONCanvasRenderer from '../../jsoncanvas/JSONCanvasRenderer.svelte';
  import type { JSONCanvas } from '../../../types/json-canvas';
  

  interface CanvasButton {
    title: string;
    href?: string;
    type?: string;
    description?: string;
    step?: number;
    contentPath?: string;
    canvas: any;
  }

  export let buttons: CanvasButton[] = [];

  let openIndex: number | null = null;
  let currentCanvas: JSONCanvas | null = null;

  function openModalFor(index: number) {
    console.log('adhashda')
    openIndex = index;
    currentCanvas = null;

    const canvas = buttons[index]?.canvas;
    if (canvas) {
      currentCanvas = canvas
    }
  }

  function closeModal() {
    openIndex = null;
    currentCanvas = null;
  }

</script>

{#if buttons && buttons.length > 0}
  {#each buttons as btn, i}
    <li>
      <button
        type="button"
        class="tree-link tree-link--orientation"
        on:click={() => openModalFor(i)}
        aria-haspopup="dialog"
        aria-expanded={openIndex === i}
      >
        <span class="tree-text text-white">{btn.title}</span>
      </button>
      <Modal open={openIndex === i} onClose={closeModal} title={btn.title}>
        {#if currentCanvas && openIndex === i}
          <JSONCanvasRenderer canvas={currentCanvas} />
        {:else}
          <div style="min-height: 120px; display: grid; place-items: center;">
            <span>Loading…</span>
          </div>
        {/if}
      </Modal>
    </li>
  {/each}
{:else}
  <li>
    <span class="tree-text" style="opacity: 0.7;">No canvas modals available.</span>
  </li>
{/if}


