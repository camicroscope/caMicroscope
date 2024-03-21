
const {JSDOM} = require('jsdom')

//test for the selected function 
describe ('selected function', ()=>{
    test('should add checked class to all elements until reaching an element with class "multidown"',()=>{
     const selected = jest.fn()

     const dom = new JSDOM('<!DOCTYPE html><html><body><ul><li></li></ul></body></html>');
     const element = dom.window.document.querySelector('li')
    selected(element)


    expect(element.classList.contains('checked')).toBe(false)
    })

    
})





    // test default values
test('gets default status of form elements', () => {
    const getStatus = jest.fn().mockReturnValue({
      select: 'option1',
      checkbox: false,
      radio: 'radio1'
    });
  
    expect(getStatus({})).toEqual({
      select: 'option1',
      checkbox: false,
      radio: 'radio1'
    });
  });

 

  