"use client"

import { useState } from "react"

const WARNING_MESSAGE_MISSING_INPUTS = "Please enter a username and password"
const WARNING_MESSAGE_TEXT_LENGTH_LIMIT = "Comment must be less than 128 characters"

interface AddCommentFormProps {
  photoId: string;
  setShowForm: () => void;
  replyTo?: string;
}

const AddCommentForm = ({ photoId, setShowForm, replyTo }: AddCommentFormProps) => {
  const [formData, setFormData] = useState({
    text: "",
    username: "",
    password: "",
    isOriginalRequest: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setWarningMessage(null);

    if (!formData.username || !formData.password) {
      setWarningMessage(WARNING_MESSAGE_MISSING_INPUTS);
      setLoading(false);
      return;
    }

    if (formData.text.length > 128) {
      setWarningMessage(WARNING_MESSAGE_TEXT_LENGTH_LIMIT);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/comments?photoId=${photoId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...formData,
          replyTo
        })
      });

      if (!res.ok) {
        throw new Error("Failed to post comment");
      }

      setShowForm();
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to post comment");
      console.error(error);
    } finally {
      setLoading(false);
      setFormData({
        text: "",
        username: "",
        password: "",
        isOriginalRequest: false
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
          Username
        </label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-stone-500 focus:ring-stone-500"
          required
        />
      </div>

      <div>
        <label htmlFor="text" className="block text-sm font-medium text-gray-700">
          Comment
        </label>
        <textarea
          id="text"
          name="text"
          value={formData.text}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-stone-500 focus:ring-stone-500"
          required
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-stone-500 focus:ring-stone-500"
          required
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isOriginalRequest"
          name="isOriginalRequest"
          checked={formData.isOriginalRequest}
          onChange={handleChange}
          className="h-4 w-4 rounded border-gray-300 text-stone-600 focus:ring-stone-500"
        />
        <label htmlFor="isOriginalRequest" className="ml-2 block text-sm text-gray-700">
          Request original photo
        </label>
      </div>

      {warningMessage && (
        <div className="text-yellow-600 text-sm">{warningMessage}</div>
      )}

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={setShowForm}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-stone-600 border border-transparent rounded-md shadow-sm hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-500 disabled:opacity-50"
        >
          {loading ? "Posting..." : "Post Comment"}
        </button>
      </div>
    </form>
  );
};

export default AddCommentForm;