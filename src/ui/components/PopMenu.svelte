<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { slide } from 'svelte/transition';
  import Button from '../components/Button.svelte';

  export let actions: Array<{ code: string; text: string }> = [];

  const dispatch = createEventDispatcher();

  let showDropdown = false;
  function toggleDropdown(e: Event) {
    e.stopPropagation();
    if (showDropdown) {
      showDropdown = false;
    } else {
      showDropdown = true;
    }
  }

  function selectAction(code: string) {
    dispatch('select', code);
  }
</script>

<svelte:body
  on:click={() => {
    showDropdown = false;
  }} />

<!--
      Dropdown panel, show/hide based on dropdown state.

      Entering: "transition ease-out duration-100"
        From: "transform opacity-0 scale-95"
        To: "transform opacity-100 scale-100"
      Leaving: "transition ease-in duration-75"
        From: "transform opacity-100 scale-100"
        To: "transform opacity-0 scale-95"
    -->
<div class="relative">
  <Button size="small" round on:click={toggleDropdown}>
    <svg
      class="fill-current inline-block h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      ><path
        d="M10 12a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0-6a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 12a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"
      /></svg
    >
  </Button>

  {#if showDropdown}
    <div
      class="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg z-50"
      class:hidden={false}
      transition:slide={{ duration: 100 }}
    >
      <div
        class="origin-top-right absolute right-0 mt-1 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
      >
        <div class="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
          {#each actions as action}
            <button
              on:click={() => selectAction(action.code)}
              class="text-sm py-2 px-4 font-normal block w-full whitespace-no-wrap bg-transparent
          text-gray-800 hover:bg-gray-100 border-0 cursor-pointer"
            >
              {action.text}
            </button>
          {/each}
        </div>
      </div>
    </div>
  {/if}
</div>
