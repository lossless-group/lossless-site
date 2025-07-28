<!-- src/components/mdx/ToolCard.svelte -->
<script>
   export let title;
   export let description;
   export let icon = "📦";
 </script>
 
 <div class="tool-card">
   <div class="icon">{icon}</div>
   <h3>{title}</h3>
   <p>{description}</p>
 </div>
 
 <style>
   .tool-card {
     border: 1px solid #e2e8f0;
     border-radius: 8px;
     padding: 1.5rem;
     margin: 1rem 0;
   }
   .icon {
     font-size: 2rem;
     margin-bottom: 0.5rem;
   }
 </style>