type Props = {
    label:string;
    name:string;
    placeholder:string;
    id?:string;
    error?:string;
    type?:'text' |'email'|'password'|'date';
    onChange?: (e : React.ChangeEvent<HTMLInputElement>) => void ;
    value?:string | number;

}

const InputLabel = ({label,name,placeholder,id,error,type,onChange,value}: Props) => {
  return (
    <div>
    <label htmlFor={name} className="sr-only">{label}</label>
    <input id={id}  name={name}  type={type ?? 'text'} autoComplete={name}  
           className="appearance-none rounded-l-md rounded-r-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
           placeholder={placeholder}  
           onChange={onChange}
           value={value}/>
        {
            error &&  <small className="text-red-500">{error}</small>
        }
</div>
  )
}

export default InputLabel