---
ID: 411
post_title: Work Item Rules in Azure Devops (VSTS)
author: mmercan
post_excerpt: ""
layout: post
permalink: >
  https://mmercan.azurewebsites.net/2019/08/15/work-item-rules-in-azure-devops-vsts/
published: true
post_date: 2019-08-15 06:41:42
---
<!-- wp:paragraph -->
<p>VSTS has very highly customizable structure, every team project has a process (default Scrum or Agile) which can be changed. Specially if you have multiple projects with different requirements on project management wants to have different fields in their work items it might be a good idea to create process for those team projects. </p>
<!-- /wp:paragraph -->

<!-- wp:image {"id":493,"width":585,"height":577} -->
<figure class="wp-block-image is-resized"><img src="/wp-content/uploads/2019/08/Work-Item-Rules-in-Azure-Devops-1.jpg" alt="" class="wp-image-493" width="585" height="577"/></figure>
<!-- /wp:image -->

<!-- wp:paragraph -->
<p>This new process will open the door to customize your work items for the projects need. you can add New work item types, States, customize the layout by adding groups  or pages, you can add new fields, </p>
<!-- /wp:paragraph -->

<!-- wp:image {"id":495} -->
<figure class="wp-block-image"><img src="/wp-content/uploads/2019/08/Work-Item-Rules-in-Azure-Devops-2-1-1024x784.jpg" alt="" class="wp-image-495"/></figure>
<!-- /wp:image -->

<!-- wp:paragraph -->
<p>all good and well but generally those requirements never ends with just adding some fields. Some fields will be required base on the state of some other field and some fields values need to be automatically  calculated .</p>
<!-- /wp:paragraph -->

<!-- wp:image {"id":498} -->
<figure class="wp-block-image"><img src="/wp-content/uploads/2019/08/Work-Item-Rules-in-Azure-Devops-3-1024x594.jpg" alt="" class="wp-image-498"/></figure>
<!-- /wp:image -->

<!-- wp:paragraph -->
<p>Work Item Rules help us to create all those rules/calculations  <br>Conditions are : (not all make sense when you planned to use as the first  condition, but  you combine them <br>like : if   <strong>No value is defined for</strong> <em>Assigned To</em> And    <strong>A work item state is</strong> <em>Closed</em><br>You can have max 2  Conditions  per Rule</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul><li> A work item state changes to ... </li><li>A work item state changes to …</li><li>A work item state is not changed … </li><li>A work item state changes from …</li><li>A work item state is …</li><li>A work item state is not …</li><li>The value of … (equals)</li><li>The value of … (not equals)</li><li>A value is defined for …</li><li>No value is defined for …</li><li>A change was made to the value of …</li><li>No change was made to the value of …</li><li>current user is member of group …</li><li>current user is not member of group …</li></ul>
<!-- /wp:list -->

<!-- wp:paragraph -->
<p>And Actions Are:<br>like :  <strong>Make required</strong> <em>TestId</em><br>You can have max 10 Actions  per Rule </p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul><li>Clear the value of …</li><li>Copy the value from …</li><li>Make read-only …</li><li>Make required …</li><li>Set the value of …</li><li>Use the current time to set the value of …</li><li>Use the current user to set the value of …</li></ul>
<!-- /wp:list -->

<!-- wp:paragraph -->
<p>as Last note, if you like to automate things even the Rules, you can use the REST API to do that too.<br>for more details :<br> <a href="https://docs.microsoft.com/en-us/rest/api/azure/devops/processes/rules?view=azure-devops-rest-5.1">https://docs.microsoft.com/en-us/rest/api/azure/devops/processes/rules?view=azure-devops-rest-5.1</a> </p>
<!-- /wp:paragraph -->