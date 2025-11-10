import { Controller } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function DeadlineSelector({ 
  control, 
  watch, 
  setValue, 
  errors, 
  isSubmitting 
}) {
  const hasDeadline = watch('hasDeadline');

  const handleCheckboxChange = (e) => {
    const checked = e.target.checked;
    setValue('hasDeadline', checked);
    
    if (!checked) {
      setValue('deadline', null);
    }
  };

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <input
          type="checkbox"
          id="hasDeadline"
          checked={hasDeadline || false}
          onChange={handleCheckboxChange}
          disabled={isSubmitting}
          className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
        />
        <label 
          htmlFor="hasDeadline" 
          className="text-sm font-medium text-gray-700 cursor-pointer"
        >
          Set a deadline
        </label>
      </div>

      {hasDeadline && (
        <div className="ml-6 mt-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Deadline Date *
          </label>
          <Controller
            name="deadline"
            control={control}
            render={({ field }) => (
              <DatePicker
                selected={field.value}
                onChange={(date) => field.onChange(date)}
                minDate={new Date()}
                dateFormat="dd MMMM yyyy"
                placeholderText="Select deadline date"
                disabled={isSubmitting}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-gray-200"
                wrapperClassName="w-full"
              />
            )}
          />
          {errors.deadline && (
            <p className="text-red-500 text-sm mt-1">{errors.deadline.message}</p>
          )}
        </div>
      )}
    </div>
  );
}