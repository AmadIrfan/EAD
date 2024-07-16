package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/mux"

	_ "github.com/denisenkom/go-mssqldb"
)

// Task represents a TODO task
type Task struct {
	ID          int       `json:"id"`
	UserID      int       `json:"userId"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	DueDate     time.Time `json:"dueDate"`
	Completed   bool      `json:"completed"`
}

var db *sql.DB

func main() {
	// Configure database connection
	server := "AMAD-IRFAN"
	database := "TasksDB"
	connString := fmt.Sprintf("server=%s;database=%s;integrated security=true", server, database)
	var err error
	db, err = sql.Open("sqlserver", connString)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// Initialize router
	r := mux.NewRouter()

	// Define API routes
	r.HandleFunc("/", redirectToTasks).Methods("GET")
	r.HandleFunc("/tasks", getTasks).Methods("GET")
	r.HandleFunc("/tasks/{id}", getTask).Methods("GET")
	r.HandleFunc("/tasks", createTask).Methods("POST")
	r.HandleFunc("/tasks/{id}", updateTask).Methods("PUT")
	r.HandleFunc("/tasks/{id}", deleteTask).Methods("DELETE")

	// Start HTTP server
	log.Println("Server started on port 8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}

func redirectToTasks(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "welcome to my api services")
}

// Handler to get all tasks
func getTasks(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query("SELECT * FROM tasks")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var tasks []Task
	for rows.Next() {
		var task Task
		err := rows.Scan(&task.ID, &task.UserID, &task.Title, &task.Description, &task.DueDate, &task.Completed)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		tasks = append(tasks, task)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tasks)
}

// Handler to get a single task
func getTask(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	row := db.QueryRow("SELECT * FROM tasks WHERE id = ?", id)
	var task Task
	err := row.Scan(&task.ID, &task.UserID, &task.Title, &task.Description, &task.DueDate, &task.Completed)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Task not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(task)
}

// Handler to create a task
func createTask(w http.ResponseWriter, r *http.Request) {
	var task Task
	err := json.NewDecoder(r.Body).Decode(&task)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	result, err := db.Exec("INSERT INTO tasks (userId, title, description, due_date, completed) VALUES (?, ?, ?, ?, ?)",
		task.UserID, task.Title, task.Description, task.DueDate, task.Completed)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	lastID, err := result.LastInsertId()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	task.ID = int(lastID)

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(task)
}

// Handler to update a task
func updateTask(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	var task Task
	err := json.NewDecoder(r.Body).Decode(&task)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	_, err = db.Exec("UPDATE tasks SET userId=?, title=?, description=?, due_date=?, completed=? WHERE id=?",
		task.UserID, task.Title, task.Description, task.DueDate, task.Completed, id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "Task updated successfully")
}

// Handler to delete a task
func deleteTask(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	_, err := db.Exec("DELETE FROM tasks WHERE id = ?", id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "Task deleted successfully")
}
