//Constructor function
function Validator(options) {
    function getParent(element,selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement
            }
            element = element.parentElement
        }
    }
    document.querySelectorAll('input[name = "gender"').forEach(cb => {
        cb.addEventListener('change', function() {
            if (this.checked) {
                document.querySelectorAll('input[name = "gender"').forEach(other => {
                    if (other != this) other.checked = false
                })
            }
        })
    })

    var selectorRules = []

    function getBirthday() {
        var yearSelect = document.getElementById('dob_year')
        var currentYear = new Date().getFullYear()
        for (let i = currentYear; i >= 1000; i--) {
            var opt = document.createElement('option')
            opt.value = i
            opt.textContent = i
            yearSelect.appendChild(opt)
        }
    }
    var monthSelect = document.getElementById('dob_month')
    var daySelect = document.getElementById('dob-day')

    function isLeapYear(year) {
        return (year % 4 === 0 && yead % 100 !== 0) || (year % 400 === 0 )
    }

    function updateDays() {
        var year = parseInt(yearSelect.value, 10)
        var month = parseInt(monthSelect.value, 10)
        if (!month) {
            daySelect.innerHTML = '<option value="">Ngày</option>'
            return
        }
        var daysInMonth = 31;
        if ([4, 6, 9, 11].includes(month)) daysInMonth = 30
        else if (month === 2) {
            daysInMonth = isLeapYear(year || 2000) ? 29 : 28
        }
        var prev = daySelect.value
        daySelect.innerHTML = '<option value="">Ngày</option>'
        for (let i = 1; i <= daysInMonth; i++ ){
            var opt = document.createElement('option')
            opt.value = i
            opt.textContent = i
            daySelect.appendChild(opt)
        }
        if(prev) daySelect.value = prev <= daysInMonth ? prev : ' '
        monthSelect.addEventListener('change', updateDays);
        yearSelect.addEventListener('change', updateDays);
    }

    //Validate action
    function validate(inputElement, rule) {
        var errorElement = getParent(inputElement,options.formGroupSelector).querySelector(options.errorSelector)
        var errorMessage

    // Take all rules of selector
        var rules = selectorRules[rule.selector]

    //Loop through rules and check
    //If fail => stop 
        for (var i = 0; i < rules.length; i++) {
            switch (inputElement.type) {
                case 'checkbox':
                case 'radio':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ":checked")
                    )
                    break
                default:
                    errorMessage = rules[i](inputElement.value)
            }
            if (errorMessage) break
        }
                    
            if (errorMessage) {
                errorElement.innerText = errorMessage
                getParent(inputElement, options.formGroupSelector).classList.add('invalid')
            }else {
                errorElement.innerText = ''
                getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
            }

            return !errorMessage
    }
    //Form element need validate
    var formElement = document.querySelector(options.form)

    if (formElement) {  
        //SUbmit form
        formElement.onsubmit = function(e) {
            e.preventDefault()

            var isFormValid = true;

            options.rules.forEach(function(rule) {
                var inputElements = formElement.querySelectorAll(rule.selector)
                var isValid = validate(inputElements, rule)
                if (!isValid) {
                    isFormValid = false
                }       
            })

            if (isFormValid) {
                //Submit case with JS
                if (typeof options.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]:not([disabled])');

                    var formValues = Array.from(enableInputs).reduce(function(values, input) {
                        switch(input.type){
                            case 'radio':
                            case 'checkbox':
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value
                                break
                            default:
                                values[input.name] = input.value
                        }
                        return values;
                    }, {})

                    options.onSubmit(formValues)
                // Submit with default
                }else {
                    formElement.submit()
                }
            }
        }
        //Loop through rules (listen blur, onput)
        options.rules.forEach(function(rule) {
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test)
            } else {
                selectorRules[rule.selector] = [rule.test]
            }

            var inputElements = formElement.querySelectorAll(rule.selector)

            Array.from(inputElements).forEach(function(inputElement){
                inputElement.onblur = function() {
                    validate(inputElement, rule)
                }
                //When user input
                inputElement.oninput = function() {
                    var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
                    errorElement.innerText = ''
                    getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
                }
            })
        })
    }
}
//Defined rules
Validator.isRequired = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            return value ? undefined : message || 'Vui lòng nhập trường này.'
        }
    }
}
Validator.isEmail = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            var regex =  /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return regex.test(value) ? undefined : message || 'Vui lòng điền email.'
        }
    }
}
Validator.minLength = function (selector, min, message) {
    return {
        selector: selector,
        test: function (value) {
            return value.length >= min ? undefined : message || `Vui lòng nhập tối thiểu ${min} kí tự`
        }
    }
}
Validator.isConfirmed = function (selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function (value) {
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác'
        }
    }
}