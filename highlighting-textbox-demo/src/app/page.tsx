"use client";
import { useState, useEffect } from "react";
import { QuestionBoxes, Question } from "./../../Components/QuestionBoxes";
import { ChatComponent } from "../../Components/ChatComponent";

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [pendingMessage, setPendingMessage] = useState(null);
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState([
    ["ai", "Feel free to ask me for help in answering these questions!"],
  ]);
  const [inputValue, setInputValue] = useState("");
  const [maxIndex, setMaxIndex] = useState(-1);

  useEffect(() => {
    if (pendingMessage !== null) {
      const fetchAIResponse = async () => {
        const aiResponse = await getAIResponse(questions[index].id, pendingMessage);
        setMessages(prev => [...prev, ["ai", aiResponse]]);
        setPendingMessage(null);
      };
      fetchAIResponse();
    }
  }, [pendingMessage, questions, index]);


  // Create a session when the component mounts
  const createSession = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/create_session");
      if (!response.ok) throw new Error("Failed to create session");

      const data = await response.json();
      setSessionId(data.session_id);
      console.log("Session created with ID:", data.session_id);
    } catch (error) {
      console.error("Error creating session:", error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const newMessage = inputValue.trim();
      if (newMessage === "") return;

      const updatedMessages = [...messages, ["user", newMessage]];
      setMessages(updatedMessages);
      setPendingMessage(newMessage);
      setInputValue("");
    }
  };



  const fetchQuestions = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/scheme`);
      if (!response.ok) throw new Error("Network response was not ok");

      const raw = await response.json();

      // Convert the object to an array of question objects
      const formatted = Object.entries(raw)
        .sort(([keyA], [keyB]) => keyA.localeCompare(keyB)) // Sorting keys alphabetically
        .map(([key, value]) => ({
          id: key,
          title: value.question,
          type: value.type === "integer" ? "number" : value.type === "boolean" ? "text" : "text",
        }));

      setQuestions(formatted);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  useEffect(() => {
    // First create a session, then fetch questions
    createSession().then(() => {
      fetchQuestions();
    });
  }, []);

  const handlePrevious = () => {
    if (index > 0) {
      setIndex(index - 1);
    }
  };

  const getAIResponse = async (questionId: string, current_question: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/gpt_helper?session_id=${sessionId}&current_question=${questionId}&current_question=${encodeURIComponent(current_question)}`);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.text();
      return data;
    } catch (error) {
      console.error("Error fetching AI helper:", error);
      return "Error fetching AI response";
    }
  };


  const handleNext = () => {
    let first = false;
    if (index > maxIndex) {
      first = true;
      setMaxIndex(Math.max(maxIndex, index));
    }

    setIndex(index + 1);

    const currentQuestion = questions[index + 1];
    const currentQuestionId = currentQuestion.id;

    // Only make the API request if we have a valid sessionId
    if (sessionId && index < questions.length && first) {
      // make a request to the server for AI message /api/gpt_helper
      fetch(`http://localhost:5000/api/gpt_helper?session_id=${sessionId}&current_question=${currentQuestionId}&current_question=${encodeURIComponent(JSON.stringify(questions[index]))}&first=${first}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.text();
        })
        .then(data => {
          // Add the AI response to the messages array
          const newMessages = [...messages, ["ai", data]];
          setMessages(newMessages);
        })
        .catch(error => {
          console.error("Error fetching AI helper:", error);
        });
    }
  };

  const handleSubmit = () => {
    // Call the postData function that is implemented elsewhere
    const data = questions.map((question) => ({
      id: question.id,
      answer: question.answer,
    }));
    const postData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/submit_form?session_id=${sessionId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data }),
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const result = await response.json();
        console.log("Data submitted successfully:", result);
      }
      catch (error) {
        console.error("Error submitting data:", error);
      }
    };
    postData();
  };

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  const isLastQuestion = index === questions.length;

  return (
    <div className="h-screen m-0 p-0">
      <div className="flex h-full">

        {/* Sidebar */}
        <div className="w-1/5 bg-gray-800 text-white p-4">
          <h1 className="text-lg font-semibold">Instructions</h1>
          <ol className="mt-4 list-decimal pl-5 text-sm">
            <li className="mb-2">Refresh the page to restart</li>
            <li className="mb-2">
              Fill out the information that is missing (highlighted) as directed by the chat explanation
            </li>
            <li className="mb-2">Large continued conversations might not work well</li>
            <li className="mb-2">All chat responses are from gpt-4.1-nano's response</li>
            <li className="mb-2">AI Responses take a few seconds</li>
          </ol>
        </div>

        {/* Main Content */}
        <div className="w-4/5 flex flex-col">

          {/* Questions Grid */}
          <div className="h-1/2 bg-gray-100 h-full overflow-y-auto">
            <QuestionBoxes questions={questions} index={index} />

            {/* Navigation Buttons */}
            <div className="flex justify-between p-4">
              <button
                onClick={handlePrevious}
                disabled={index === 0}
                className={`px-4 py-2 rounded ${index === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
              >
                Previous
              </button>

              {isLastQuestion ? (
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
                >
                  Submit
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
                >
                  Next
                </button>
              )}
            </div>
          </div>

          {/* Chat Placeholder */}
          <div className="h-1 bg-gray-300" style={{ height: "5px", backgroundColor: "black" }}></div>
          <ChatComponent messages={messages} />
          <div className="flex justify-center items-center h-15 bg-gray-200">
            <textarea
              className="w-full h-full border border-gray-400 rounded p-2 resize-none text-black"
              placeholder="Type here..."
              style={{ boxSizing: "border-box" }}
              rows={1}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
