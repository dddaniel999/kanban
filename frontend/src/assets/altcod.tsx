//   const handleEdit = async (task: Task) => {
//     const newTitle = prompt("Modifică titlul task-ului:", task.title);
//     if (newTitle && newTitle.trim() !== "" && newTitle !== task.title) {
//       try {
//         const updated = await updateTask({ ...task, title: newTitle });
//         setTasks((prev) =>
//           prev.map((t) => (t.id === updated.id ? updated : t))
//         );
//       } catch {
//         alert("Eroare la actualizarea task-ului.");
//       }
//     }
//   };

//   const handleDelete = async (taskId: number) => {
//     if (window.confirm("Ștergi task-ul?")) {
//       try {
//         await deleteTask(taskId);
//         setTasks((prev) => prev.filter((t) => t.id !== taskId));
//       } catch {
//         alert("Eroare la ștergerea task-ului.");
//       }
//     }
//   };
