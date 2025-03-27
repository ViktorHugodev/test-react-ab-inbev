"use client"

import * as React from "react"
import { useRef, useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, CaptionProps, useDayPicker } from "react-day-picker"
import { ptBR } from "date-fns/locale"
import { addYears, subYears } from "date-fns"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  ScrollArea 
} from "@/components/ui/scroll-area"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  month,
  onMonthChange,
  ...props
}: CalendarProps) {
  
  const [internalMonth, setInternalMonth] = useState<Date>(month || new Date())
  
  
  useEffect(() => {
    if (month) {
      setInternalMonth(month)
    }
  }, [month])
  
  
  const handleMonthChange = (date: Date) => {
    
    if (onMonthChange) {
      onMonthChange(date)
    } else {
      
      setInternalMonth(date)
    }
  }

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      month={month || internalMonth}
      onMonthChange={handleMonthChange}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "hidden", 
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_start: "day-range-start",
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("h-4 w-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("h-4 w-4", className)} {...props} />
        ),
        Caption: (captionProps) => (
          <CustomCaption 
            {...captionProps} 
            onMonthSelect={handleMonthChange}
          />
        )
      }}
      locale={ptBR}
      disabled={props.disabled || { after: new Date() }} 
      {...props}
    />
  )
}


interface CustomCaptionProps extends CaptionProps {
  onMonthSelect: (date: Date) => void;
}


function CustomCaption({ displayMonth, onMonthSelect }: CustomCaptionProps) {
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", 
    "Maio", "Junho", "Julho", "Agosto", 
    "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  
  
  
  const today = new Date();
  const maxYear = today.getFullYear() - 18; 
  const minYear = maxYear - 82; 
  
  
  const years = Array.from(
    { length: (maxYear - minYear) + 1 }, 
    (_, i) => maxYear - i
  );
  
  const currentMonth = displayMonth.getMonth();
  const currentDisplayYear = displayMonth.getFullYear();
  
  const handleMonthChange = (value: string) => {
    const newMonth = parseInt(value);
    const newDate = new Date(currentDisplayYear, newMonth, 1);
    onMonthSelect(newDate);
  };
  
  const handleYearChange = (value: string) => {
    const newYear = parseInt(value);
    const newDate = new Date(newYear, currentMonth, 1);
    onMonthSelect(newDate);
  };
  
  return (
    <div className="flex justify-center items-center gap-1 px-8 py-1">
      <Select value={currentMonth.toString()} onValueChange={handleMonthChange}>
        <SelectTrigger className="h-7 w-[110px] text-xs font-medium">
          <SelectValue placeholder="Mês" />
        </SelectTrigger>
        <SelectContent>
          {months.map((month, i) => (
            <SelectItem key={i} value={i.toString()} className="text-xs">
              {month}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select value={currentDisplayYear.toString()} onValueChange={handleYearChange}>
        <SelectTrigger className="h-7 w-[90px] text-xs font-medium">
          <SelectValue placeholder="Ano" />
        </SelectTrigger>
        <SelectContent>
          <ScrollArea className="h-60">
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()} className="text-xs">
                {year}
              </SelectItem>
            ))}
          </ScrollArea>
        </SelectContent>
      </Select>
    </div>
  );
}

Calendar.displayName = "Calendar"

export { Calendar }